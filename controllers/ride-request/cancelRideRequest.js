const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const Transaction = require("../../models/finance/transaction.schema");
const Notification = require("../../models/notification");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * Cancel a ride request (ACID + notification + socket "reloadNotifications")
 */
const cancelRideRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const { request_id, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(request_id)) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Invalid request_id" });
    }

    // Find the ride for this user
    const ride = await RideRequest.findOne({
      _id: request_id,
      user_id: userId,
    }).session(session);

    if (!ride) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Ride request not found." });
    }

    // If not accepted, simple cancel
    if (["created", "posted"].includes(ride.status)) {
      ride.status = "cancelled";
      ride.cancelledAt = new Date();
      ride.cancel_reason = reason || null;
      await ride.save({ session });
      await session.commitTransaction();
      session.endSession();
      return sendSuccessResponse(res, "Ride request cancelled successfully.");
    }

    // === If ACCEPTED, rollback wallet and notify truck ===
    if (ride.status === "accepted") {
      const acceptedOffer = ride.offers.id(ride.accepted_offer);
      if (!acceptedOffer) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ success: false, message: "Accepted offer not found." });
      }
      const truckId = acceptedOffer.truck_id;

      // Find Admin, wallets
      const adminUser = await User.findOne({
        user_name: "Admin",
        role: "admin",
      });
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

      // Get client email for logs
      const clientUser = await User.findById(userId).session(session);
      const clientEmail = clientUser?.email || userId;

      // Calculate and reverse commission
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

      // Log transactions
      await Transaction.insertMany(
        [
          {
            user_id: truckerWallet.user_id,
            wallet_id: truckerWallet._id,
            type: "credit",
            amount: commissionAmount,
            ride_request_id: ride._id,
            status: "confirmed",
            remarks: "Commission refunded on ride cancellation",
            balanceAfter: truckerWallet.balance,
            log: [
              {
                action: "cancel_refund",
                by: userId,
                note: `${clientEmail} cancelled the ride due to reason: ${
                  reason || ""
                }. App charges refunded`,
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
            remarks: "Commission reversed on ride cancellation",
            balanceAfter: adminWallet.balance,
            log: [
              {
                action: "cancel_refund",
                by: userId,
                note: `${clientEmail} Cancelled ride. App charges refunded due to reason: ${
                  reason || ""
                }`,
              },
            ],
          },
        ],
        { session, ordered: true }
      );

      // Make truck's other offers available in other posted rides
      await RideRequest.updateMany(
        {
          _id: { $ne: ride._id },
          "offers.truck_id": truckId,
          "offers.available": false,
          status: "posted",
        },
        { $set: { "offers.$[elem].available": true } },
        { arrayFilters: [{ "elem.truck_id": truckId }], session }
      );

      // Update this ride
      ride.status = "cancelled";
      ride.cancelledAt = new Date();
      ride.cancel_reason = reason || null;
      ride.accepted_offer = null;
      ride.offers.forEach((offer) => {
        offer.available = offer._id.toString() !== acceptedOffer._id.toString();
      });
      await ride.save({ session });

      // Save notification (in DB, not over socket)
      try {
        await Notification.create(
          [
            {
              user_id: truckId,
              type: "rideCancelled",
              ride_id: ride._id,
              message: `The client (${clientEmail}) has cancelled the ride${
                reason ? " for " + reason : ""
              }.`,
              read: false,
              createdAt: new Date(),
            },
          ],
          { session }
        );
      } catch (e) {
        console.warn("Notification save failed for rideCancelled:", e);
        // Don't abort tx for notification failure
      }

      // Emit socket event to truck to reload notifications (no sensitive data)
      try {
        const io = req.app.get("io");
        if (io && truckId) {
          io.to(`truck_${truckId}`).emit("reloadNotifications", {
            reload: true,
          });
        }
      } catch (e) {
        console.warn("Socket emit failed for reloadNotifications:", e);
      }

      await session.commitTransaction();
      session.endSession();

      // Success response (no notification data in response)
      return res.status(200).json({
        success: true,
        message: "Ride request cancelled and commission reversed.",
      });
    }

    // Not cancellable
    await session.abortTransaction();
    session.endSession();
    return res.status(404).json({
      success: false,
      message: "Ride request not in a cancellable state.",
    });
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    next(err);
  }
};

module.exports = cancelRideRequest;
