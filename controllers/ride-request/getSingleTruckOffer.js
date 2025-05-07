const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
/**
 * @swagger
 * /ride-request/truck-offer:
 *   post:
 *     summary: Get the truck's specific offer for a ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_id, truck_id]
 *             properties:
 *               request_id:
 *                 type: string
 *               truck_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer found successfully
 */
const getSingleTruckOffer = async (req, res, next) => {
  try {
    const { request_id, truck_id } = req.body;

    if (!request_id || !truck_id) {
      return next(new Error("request_id and truck_id are required."));
    }

    const rideRequest = await RideRequest.findOne(
      {
        _id: new ObjectId(request_id),
        "offers.truck_id": new ObjectId(truck_id),
      },
      {
        offers: {
          $elemMatch: { truck_id: new ObjectId(truck_id) },
        },
      }
    ).populate("offers.truck_id", "user_name geolocation rating");

    if (
      !rideRequest ||
      !rideRequest.offers ||
      rideRequest.offers.length === 0
    ) {
      return next(new Error("Offer not found for this truck."));
    }

    const offer = rideRequest.offers[0];
    const formattedOffer = {
      truck_username: offer.truck_id?.user_name || "Unknown",
      truck_location: offer.truck_id?.geolocation?.coordinates || [0, 0],
      truck_rating: offer.truck_id?.rating ?? null,
      offered_price: offer.offered_price,
      time_to_reach: offer.time_to_reach,
      offer_updated_at: offer.updatedAt || null,
      client_counter_price: offer.client_counter_price ?? null,
    };

    return sendSuccessResponse(
      res,
      "Offer retrieved successfully.",
      formattedOffer
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = getSingleTruckOffer;
