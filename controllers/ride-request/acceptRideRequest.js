const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const Transaction = require("../../models/finance/transaction.schema");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * PATCH /ride-request/accept
 * Accept a ride request, process commission transfer, and notify the truck driver.
 * All financial/database changes are atomic.
 */
const acceptRideRequest = async (req, res, next) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id; // Client who is accepting the offer
    const { request_id, offer_id } = req.body;

    // 1. Input Validation
    if (!request_id || !offer_id) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Both request_id and offer_id are required.",
      });
    }
    if (
      !mongoose.Types.ObjectId.isValid(request_id) ||
      !mongoose.Types.ObjectId.isValid(offer_id)
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid request_id or offer_id format.",
      });
    }

    // 2. Atomically update the RideRequest (only if status is 'posted' and offer exists)
    const updated = await RideRequest.findOneAndUpdate(
      {
        _id: request_id,
        user_id: userId,
        status: "posted",
        "offers._id": offer_id,
      },
      {
        status: "accepted",
        accepted_offer: offer_id,
      },
      { new: true, session }
    );
    if (!updated) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Ride request not found, not posted, or invalid offer.",
      });
    }

    // 3. Find the accepted offer subdocument
    const acceptedOffer = updated.offers.id(offer_id);
    if (!acceptedOffer) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Accepted offer not found in ride request.",
      });
    }

    // 4. Retrieve trucker's wallet
    const truckerWallet = await Wallet.findOne({ user_id: acceptedOffer.truck_id }).session(session);
    if (!truckerWallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Trucker's wallet not found.",
      });
    }

    // 5. Retrieve commission wallet (admin admin)
    const commissionUser = await User.findOne({ user_name: "admin", role: "admin" }).session(session);
    if (!commissionUser) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Commission admin user not found.",
      });
    }
    const commissionWallet = await Wallet.findOne({ user_id: commissionUser._id }).session(session);
    if (!commissionWallet) {
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: "Commission wallet not found.",
      });
    }

    // 6. Calculate 10% commission
    const commissionAmount = Math.round(acceptedOffer.offered_price * 0.10 * 100) / 100;

    // 7. Check if trucker has enough balance
    if (truckerWallet.balance < commissionAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Trucker does not have enough balance to pay commission.",
      });
    }

    // 8. Deduct commission from trucker, add to commission wallet
    truckerWallet.balance -= commissionAmount;
    commissionWallet.balance += commissionAmount;
    await truckerWallet.save({ session });
    await commissionWallet.save({ session });

    // 9. Record both transactions (fix: add ordered: true)
    await Transaction.create([
      {
        user_id: truckerWallet.user_id,
        wallet_id: truckerWallet._id,
        type: "debit",
        amount: commissionAmount,
        ride_request_id: updated._id,
        status: "confirmed",
        remarks: "Commission for ride offer acceptance",
        balanceAfter: truckerWallet.balance,
        log: [{
          action: "confirmed",
          by: userId,
          note: "Commission charged on offer acceptance"
        }]
      },
      {
        user_id: commissionWallet.user_id,
        wallet_id: commissionWallet._id,
        type: "credit",
        amount: commissionAmount,
        status: "confirmed",
        remarks: "Commission received for ride offer acceptance",
        balanceAfter: commissionWallet.balance,
        log: [{
          action: "confirmed",
          by: userId,
          note: `Commission from trucker ${acceptedOffer.truck_id}`
        }]
      }
    ], { session, ordered: true }); // <--- FIXED!


    // 10. Commit all changes atomically
    await session.commitTransaction();
    session.endSession();

    // 11. (Post-commit) Notify truck driver via socket.io (side-effect, not atomic)
    const clientUser = await User.findById(updated.user_id).select("user_name");
    const io = req.app.get("io");
    if (io) {
      const truckRoom = `truck_${acceptedOffer.truck_id.toString()}`;
      const payload = {
        request_id: updated._id.toString(),
        offer_id,
        client_id: updated.user_id.toString(),
        client_name: clientUser?.user_name || "Client",
        offered_price: acceptedOffer.offered_price,
        origin: {
          latitude: updated.origin_location.coordinates[1],
          longitude: updated.origin_location.coordinates[0],
        },
        destination: {
          latitude: updated.dest_location.coordinates[1],
          longitude: updated.dest_location.coordinates[0],
        },
      };

      console.log("🔔 Emitting 'offerAccepted' to:", truckRoom);
      io.to(truckRoom).emit("offerAccepted", payload);
    } else {
      console.warn("⚠️ Socket.IO instance not available on req.app");
    }

    // 12. Respond to client with success and details
    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: updated._id.toString(),
      offer_id,
    });

  } catch (err) {
    // Rollback transaction on any error
    try { await session.abortTransaction(); session.endSession(); } catch (e) {}
    console.error("❌ acceptRideRequest error:", err.message);
    next(err);
  }
};

module.exports = acceptRideRequest;
