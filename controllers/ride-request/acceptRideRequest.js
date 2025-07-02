const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const Transaction = require("../../models/finance/transaction.schema");
const sendSuccessResponse = require("../../utils/success-response");

const acceptRideRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const clientId = req.user.id;
    const { request_id: requestId, offer_id: offerId } = req.body;

    if (!requestId || !offerId) {
      return res.status(400).json({ success: false, message: "Both request_id and offer_id are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ success: false, message: "Invalid request_id or offer_id format." });
    }

    // Step 1: Fetch the ride and validate ownership
    const ride = await RideRequest.findOne({
      _id: requestId,
      status: "posted",
      "offers._id": offerId,
    }).session(session);

    if (!ride) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Ride request not found, not posted, or invalid offer.",
      });
    }

    if (ride.user_id.toString() !== clientId) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "Unauthorized: You are not the owner of this ride request." });
    }

    const acceptedOffer = ride.offers.id(offerId);

    if (!acceptedOffer || !acceptedOffer.available) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Unable to submit counter offer. The ride may be closed or the truck may no longer be available.",
      });
    }

    // Step 2: Update ride status and accepted_offer
    ride.status = "accepted";
    ride.accepted_offer = offerId;
    ride.updatedAt = new Date(); // refresh timestamp
    await ride.save({ session });

    // Step 3: Fetch trucker and admin wallets
    const truckerWallet = await Wallet.findOne({ user_id: acceptedOffer.truck_id }).session(session);
    const adminUser = await User.findOne({ user_name: "Admin", role: "admin" });
    const adminWallet = await Wallet.findOne({ user_id: adminUser._id }).session(session);

    if (!truckerWallet || !adminWallet) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Wallets not found." });
    }

    const commissionAmount = Math.round(acceptedOffer.offered_price * 0.1 * 100) / 100;

    if (truckerWallet.balance < commissionAmount) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Insufficient balance for commission deduction." });
    }

    // Step 4: Update wallet balances
    truckerWallet.balance -= commissionAmount;
    adminWallet.balance += commissionAmount;
    await truckerWallet.save({ session });
    await adminWallet.save({ session });

    // Step 5: Mark accepted offer unavailable
    await RideRequest.updateOne(
      { _id: ride._id, "offers._id": offerId },
      { $set: { "offers.$.available": false } },
      { session }
    );

    // Step 6: Mark other offers by same truck as unavailable from other posted rides
    await RideRequest.updateMany(
      {
        _id: { $ne: ride._id },
        "offers.truck_id": acceptedOffer.truck_id,
        "offers.available": true,
        status: "posted"
      },
      {
        $set: { "offers.$[elem].available": false }
      },
      {
        arrayFilters: [{ "elem.truck_id": acceptedOffer.truck_id }],
        session
      }
    );

    // Step 7: Log both debit and credit transactions
    await Transaction.insertMany([
      {
        user_id: truckerWallet.user_id,
        wallet_id: truckerWallet._id,
        type: "debit",
        amount: commissionAmount,
        ride_request_id: ride._id,
        status: "confirmed",
        remarks: "Commission for ride offer acceptance",
        balanceAfter: truckerWallet.balance,
        log: [{
          action: "confirmed",
          by: clientId,
          note: "Commission charged on offer acceptance"
        }]
      },
      {
        user_id: adminWallet.user_id,
        wallet_id: adminWallet._id,
        type: "credit",
        amount: commissionAmount,
        ride_request_id: ride._id,
        status: "confirmed",
        remarks: "Commission received for ride offer acceptance",
        balanceAfter: adminWallet.balance,
        log: [{
          action: "confirmed",
          by: clientId,
          note: `Commission from trucker ${acceptedOffer.truck_id}`
        }]
      }
    ], { session, ordered: true });

    // Step 8: Emit socket event to truck
    try {
      const clientUser = await User.findById(ride.user_id).select("user_name");
      const io = req.app.get("io");
      if (io) {
        const payload = {
          request_id: ride._id.toString(),
          offer_id: ride.accepted_offer.toString(),
          client_id: ride.user_id.toString(),
          client_name: clientUser?.user_name ?? "Client",
          offered_price: acceptedOffer.offered_price,
          origin: {
            latitude: ride.origin_location.coordinates[1],
            longitude: ride.origin_location.coordinates[0],
          },
          destination: {
            latitude: ride.dest_location.coordinates[1],
            longitude: ride.dest_location.coordinates[0],
          }
        };
        io.to(`truck_${acceptedOffer.truck_id}`).emit("offerAccepted", payload);
        console.log("🔔 Emitted 'offerAccepted' to:", `truck_${acceptedOffer.truck_id}`);
      }
    } catch (socketErr) {
      console.error("⚠️ Socket emit failed:", socketErr);
    }

    // Step 9: Commit transaction
    await session.commitTransaction();
    session.endSession();

    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: ride._id.toString(),
      offer_id: ride.accepted_offer.toString(),
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ acceptRideRequest error:", err);
    next(err);
  }
};

module.exports = acceptRideRequest;
