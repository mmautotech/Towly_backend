// controllers/ride-request/addOfferToRideRequest.js
const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/add-offer:
 *   post:
 *     summary: Add or update an offer to a ride request
 *     security:
 *       - bearerAuth: []
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_id, offered_price]
 *             properties:
 *               request_id:
 *                 type: string
 *               offered_price:
 *                 type: number
 *               days:
 *                 type: integer
 *               hours:
 *                 type: integer
 *               minutes:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Offer added or updated
 *       400:
 *         description: Missing or invalid IDs
 *       404:
 *         description: Ride request not found
 */
const addOfferToRideRequest = async (req, res, next) => {
  try {
    const truckId = req.user.id;
    let { request_id, offered_price, days, hours, minutes } = req.body;

    if (!request_id || offered_price == null) {
      return res.status(400).json({
        success: false,
        message: "request_id and offered_price are required."
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(request_id) ||
      !mongoose.Types.ObjectId.isValid(truckId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request_id or truck_id."
      });
    }

    days    = parseInt(days ?? 0,   10);
    hours   = parseInt(hours ?? 0,  10);
    minutes = parseInt(minutes ?? 0,10);
    const time_to_reach = `${days}d ${hours}h ${minutes}m`;

    const rideReqObjectId   = new mongoose.Types.ObjectId(request_id);
    const truckUserObjectId = new mongoose.Types.ObjectId(truckId);

    const updateResult = await RideRequest.updateOne(
      { _id: rideReqObjectId, "offers.truck_id": truckUserObjectId },
      {
        $set: {
          "offers.$.offered_price": offered_price,
          "offers.$.time_to_reach":  time_to_reach,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      const pushResult = await RideRequest.updateOne(
        { _id: rideReqObjectId },
        {
          $push: {
            offers: {
              truck_id:      truckUserObjectId,
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
