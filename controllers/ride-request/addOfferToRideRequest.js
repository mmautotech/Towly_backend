const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/add-offer:
 *   post:
 *     summary: Add or update an offer to a ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OfferInput'
 *     responses:
 *       200:
 *         description: Offer added or updated
 */
/**
 * @desc Truck driver adds or updates an offer to a ride request
 * @route POST /api/ride-request/add-offer
 */
const addOfferToRideRequest = async (req, res, next) => {
  try {
    let { request_id, truck_id, offered_price, days, hours, minutes } =
      req.body;

    if (!request_id || !truck_id || offered_price == null) {
      return next(
        new Error("request_id, truck_id, and offered_price are required.")
      );
    }

    // Set defaults
    days = parseInt(days ?? 0, 10);
    hours = parseInt(hours ?? 0, 10);
    minutes = parseInt(minutes ?? 0, 10);

    const time_to_reach = `${days}d ${hours}h ${minutes}m`;

    if (!request_id || !truck_id || !offered_price || !time_to_reach) {
      return next(
        new Error(
          "request_id, truck_id, offered_price and time_to_reach are required."
        )
      );
    }

    const rideRequestObjectId = new ObjectId(request_id);
    const truckUserObjectId = new ObjectId(truck_id);

    // Try to update existing offer
    const updateResult = await RideRequest.updateOne(
      {
        _id: rideRequestObjectId,
        "offers.truck_id": truckUserObjectId,
      },
      {
        $set: {
          "offers.$.offered_price": offered_price,
          "offers.$.time_to_reach": time_to_reach,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      // No existing offer from this truck — push a new one
      const pushResult = await RideRequest.updateOne(
        { _id: rideRequestObjectId },
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
        return next(new Error("Ride request not found."));
      }

      return sendSuccessResponse(res, "New offer added successfully.");
    }

    return sendSuccessResponse(res, "Offer updated successfully.");
  } catch (error) {
    return next(error);
  }
};

module.exports = addOfferToRideRequest;
