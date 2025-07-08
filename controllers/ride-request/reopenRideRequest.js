const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const Transaction = require("../../models/finance/transaction.schema");
const Notification = require("../../models/notification");
const sendSuccessResponse = require("../../utils/success-response");

const reopenRideRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { request_id, reason } = req.body;

    // 1. Validate input
    if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing request_id" });
    }

    // 2. Find ride by ID and status only
    const ride = await RideRequest.findOne({
      _id: request_id,
      status: "accepted",
    }).session(session);

    if (!ride) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be reopened",
      });
    }

    // 3. Check permissions: only client or accepted truck can do this
    const acceptedOffer = ride.offers.id(ride.accepted_offer);
    if (!acceptedOffer) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Accepted offer not found." });
    }
    const truckId = acceptedOffer.truck_id?.toString();
    const isClient = ride.user_id.toString() === userId;
    const isTruck = truckId === userId;

    if (!isClient && !isTruck) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reopen this ride.",
      });
    }

    // ---- Get email for message ----
    let actorEmail = "";
    if (isClient) {
      const clientUser = await User.findById(ride.user_id).session(session);
      actorEmail = clientUser?.email || "client";
    } else if (isTruck) {
      const truckUser = await User.findById(truckId).session(session);
      actorEmail = truckUser?.email || "truck";
    }

    // -- WALLET LOGIC: Reverse debit/credit for commission --
    const adminUser = await User.findOne({ user_name: "Admin", role: "admin" });
    if (!adminUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Admin user not found." });
    }

    const truckerWallet = await Wallet.findOne({ user_id: truckId }).session(
      session
    );
    const adminWallet = await Wallet.findOne({
      user_id: adminUser._id,
    }).session(session);

    if (!truckerWallet || !adminWallet) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Wallets not found." });
    }

    const commissionAmount =
      Math.round(acceptedOffer.offered_price * 0.1 * 100) / 100;

    truckerWallet.balance += commissionAmount;
    adminWallet.balance -= commissionAmount;

    if (adminWallet.balance < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Admin wallet insufficient for reversal.",
      });
    }

    await truckerWallet.save({ session });
    await adminWallet.save({ session });

    // 4. Mark other offers by same truck as AVAILABLE from other posted rides (reverse the previous unavailable)
    await RideRequest.updateMany(
      {
        _id: { $ne: ride._id },
        "offers.truck_id": truckId,
        "offers.available": false,
        status: "posted",
      },
      {
        $set: { "offers.$[elem].available": true },
      },
      {
        arrayFilters: [{ "elem.truck_id": truckId }],
        session,
      }
    );

    // 5. Log both debit and credit transactions for the reversal (with custom note)
    const notePrefix = `${actorEmail} ${
      isClient ? "Client" : "Trucker"
    } reopened/cancelled ride for reason: ${reason || ""}.App charges refunded`;
    await Transaction.insertMany(
      [
        {
          user_id: truckerWallet.user_id,
          wallet_id: truckerWallet._id,
          type: "credit",
          amount: commissionAmount,
          ride_request_id: ride._id,
          status: "confirmed",
          remarks: "Reversal: Commission refunded on ride reopening",
          balanceAfter: truckerWallet.balance,
          log: [
            {
              action: "reversal",
              by: userId,
              note: notePrefix,
            },
          ],
        },
        {
          user_id: adminWallet.user_id,
          wallet_id: adminWallet._id,
          type: "debit",
          amount: commissionAmount,
          ride_request_id: ride._id,
          status: "confirmed",
          remarks: "Reversal: Commission taken back on ride reopening",
          balanceAfter: adminWallet.balance,
          log: [
            {
              action: "reversal",
              by: userId,
              note: notePrefix,
            },
          ],
        },
      ],
      { session, ordered: true }
    );

    // 6. Set ride status to "posted", clear accepted_offer, set all offers available (except the previously accepted one)
    ride.status = "posted";
    ride.accepted_offer = null;
    ride.reopenedAt = new Date();
    ride.reopened_by = userId;
    ride.reopen_reason = reason || null;
    ride.offers.forEach((offer) => {
      // Keep the accepted offer unavailable, others available
      offer.available = offer._id.toString() !== acceptedOffer._id.toString();
    });
    await ride.save({ session });

    // 7. Notification and minimal socket emit (reload pattern)
    const io = req.app.get("io");
    let notificationData = {
      type: "rideReopened",
      ride_id: ride._id,
      message: "",
      read: false,
      createdAt: new Date(),
    };

    if (isClient) {
      // Client reopened/cancelled — notify truck
      notificationData.user_id = truckId;
      notificationData.message = `The client (${actorEmail}) has declined the offer, ${
        reason ? " for " + reason : ""
      }.`;
      await Notification.create([notificationData], { session });

      // Minimal socket event (reload) to truck
      if (io && truckId) {
        io.to(`truck_${truckId}`).emit("reloadNotifications", { reload: true });
      }
    } else if (isTruck) {
      // Truck reopened/cancelled — notify client
      notificationData.user_id = ride.user_id;
      notificationData.message = `The truck (${actorEmail}) has declined the ride, ${
        reason ? " for " + reason : ""
      }.`;
      await Notification.create([notificationData], { session });

      if (io) {
        io.to(`client_${ride.user_id.toString()}`).emit("reloadNotifications", {
          reload: true,
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return sendSuccessResponse(
      res,
      "Ride request reopened, balances reversed, and notification sent."
    );
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    next(err);
  }
};

module.exports = reopenRideRequest;
