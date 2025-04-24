/**
 * @swagger
 * /ride-request/offers:
 *   post:
 *     summary: Get all offers for a specific ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, request_id]
 *             properties:
 *               user_id:
 *                 type: string
 *               request_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of enriched offers retrieved successfully
 */

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const RideRequest = require("../../models/ride-request");

const getOffersForRideRequest = async (req, res, next) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      return next(new Error("user_id and request_id are required."));
    }

    const request = await RideRequest.findOne({
      _id: new ObjectId(request_id),
      user_id: new ObjectId(user_id),
    }).populate("offers.truck_id", "user_name geolocation rating");

    if (!request) {
      return next(new Error("Ride request not found."));
    }

    const formattedOffers = (request.offers || []).map((offer) => ({
      truck_username: offer.truck_id?.user_name || "Unknown",
      truck_location: offer.truck_id?.geolocation?.coordinates || [0, 0],
      truck_rating: offer.truck_id?.rating ?? null,
      offered_price: offer.offered_price,
      time_to_reach: offer.time_to_reach,
      offer_updated_at: offer.updatedAt || null,
    }));

    return res.status(200).json({
      success: true,
      message: "Offers retrieved successfully.",
      offers: formattedOffers,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = getOffersForRideRequest;
