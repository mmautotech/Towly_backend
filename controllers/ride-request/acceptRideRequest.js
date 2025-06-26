// controllers/ride-request/acceptRideRequest.js

const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const Transaction = require("../../models/finance/transaction.schema");
const sendSuccessResponse = require("../../utils/success-response");

const acceptRideRequest = async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const { request_id: requestId, offer_id: offerId } = req.body;

    if (!requestId || !offerId) {
      return res.status(400).json({ success: false, message: "Both request_id and offer_id are required." });
    }

    if (
      !mongoose.Types.ObjectId.isValid(requestId) ||
      !mongoose.Types.ObjectId.isValid(offerId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid request_id or offer_id format." });
    }

    // Step 1: Find and update the ride request
    const ride = await RideRequest.findOneAndUpdate(
      {
        _id: requestId,
        user_id: clientId,
        status: "posted",
        "offers._id": offerId
      },
      {
        status: "accepted",
        accepted_offer: offerId
      },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride request not found, not posted, or invalid offer." });
    }

    const acceptedOffer = ride.offers.id(offerId);
    if (!acceptedOffer) {
      return res.status(500).json({ success: false, message: "Accepted offer not found in ride request." });
    }

    // Step 2: Get trucker and admin wallets
    const truckerWallet = await Wallet.findOne({ user_id: acceptedOffer.truck_id });
    if (!truckerWallet) {
      return res.status(404).json({ success: false, message: "Trucker's wallet not found." });
    }

    const commissionAdmin = await User.findOne({ user_name: "Admin", role: "admin" });
    if (!commissionAdmin) {
      return res.status(500).json({ success: false, message: "Commission-admin user not found." });
    }

    const commissionWallet = await Wallet.findOne({ user_id: commissionAdmin._id });
    if (!commissionWallet) {
      return res.status(500).json({ success: false, message: "Commission wallet not found." });
    }

    // Step 3: Check balance
    const commissionAmount = Math.round(acceptedOffer.offered_price * 0.1 * 100) / 100;
    if (truckerWallet.balance < commissionAmount) {
      return res.status(400).json({ success: false, message: "Trucker does not have enough balance to pay commission." });
    }

    // Step 4: Deduct and update
    truckerWallet.balance -= commissionAmount;
    commissionWallet.balance += commissionAmount;
    await truckerWallet.save();
    await commissionWallet.save();

    // Step 5: Log transactions
    await Transaction.create([
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
        user_id: commissionWallet.user_id,
        wallet_id: commissionWallet._id,
        type: "credit",
        amount: commissionAmount,
        status: "confirmed",
        remarks: "Commission received for ride offer acceptance",
        balanceAfter: commissionWallet.balance,
        log: [{
          action: "confirmed",
          by: clientId,
          note: `Commission from trucker ${acceptedOffer.truck_id}`
        }]
      }
    ]);

    // Step 6: Notify truck via socket
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
      const truckRoom = `truck_${acceptedOffer.truck_id}`;
      io.to(truckRoom).emit("offerAccepted", payload);
      console.log("🔔 Emitted 'offerAccepted' to:", truckRoom);
    }

    // Step 7: Final response
    return sendSuccessResponse(res, "Offer accepted successfully", {
      request_id: ride._id.toString(),
      offer_id: ride.accepted_offer.toString(),
    });

  } catch (err) {
    console.error("❌ acceptRideRequest error:", err);
    next(err);
  }
};

module.exports = acceptRideRequest;
