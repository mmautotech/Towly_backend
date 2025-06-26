const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const Wallet = require("../../models/finance/wallet.schema");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * Add or update an offer to a ride request (wallet balance validation included)
 */
const addOfferToRideRequest = async (req, res, next) => {
  try {
    const truckId = req.user.id;
    let { request_id, offered_price, days, hours, minutes } = req.body;

    // Basic input checks
    if (!request_id || offered_price == null) {
      return res.status(400).json({
        success: false,
        message: "request_id and offered_price are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(request_id) ||
      !mongoose.Types.ObjectId.isValid(truckId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request_id or truck_id.",
      });
    }

    // ✅ Step 1: Check wallet balance
    const truckWallet = await Wallet.findOne({ user_id: truckId });
    if (!truckWallet) {
      return res.status(404).json({
        success: false,
        message: "Truck wallet Empty.",
      });
    }

    const requiredCommission = Math.round(offered_price * 0.10 * 100) / 100;
    if (truckWallet.balance < requiredCommission) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. You need at least £${requiredCommission.toFixed(2)} to make this offer.`,
      });
    }

    // ✅ Step 2: Time formatting
    days = parseInt(days ?? 0, 10);
    hours = parseInt(hours ?? 0, 10);
    minutes = parseInt(minutes ?? 0, 10);
    const time_to_reach = `${days}d ${hours}h ${minutes}m`;

    const rideReqObjectId = new mongoose.Types.ObjectId(request_id);
    const truckUserObjectId = new mongoose.Types.ObjectId(truckId);

    // ✅ Step 3: Try updating existing offer
    const updateResult = await RideRequest.updateOne(
      { _id: rideReqObjectId, "offers.truck_id": truckUserObjectId },
      {
        $set: {
          "offers.$.offered_price": offered_price,
          "offers.$.time_to_reach": time_to_reach,
        },
      }
    );

    // ✅ Step 4: If not found, push new offer
    if (updateResult.modifiedCount === 0) {
      const pushResult = await RideRequest.updateOne(
        { _id: rideReqObjectId },
        {
          $push: {
            offers: {
              truck_id: truckUserObjectId,
              offered_price,
              time_to_reach,
            },
          },
        }
      );
      if (pushResult.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Ride request not found.",
        });
      }

      return sendSuccessResponse(res, "New offer added successfully.");
    }

    return sendSuccessResponse(res, "Offer updated successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = addOfferToRideRequest;
