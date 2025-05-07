const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
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
 *                 example: "6809df40e39801f2e976d94b"
 *               request_id:
 *                 type: string
 *                 example: "680a484be39801f2e976da3b"
 *     responses:
 *       200:
 *         description: List of enriched offers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Offers retrieved successfully.
 *                 offers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       offer_id:
 *                         type: string
 *                         example: "646a2a56e8414e38700a3627"
 *                       truck_username:
 *                         type: string
 *                         example: "Waqas"
 *                       truck_location:
 *                         type: array
 *                         items:
 *                           type: number
 *                         example: [74.3587, 31.5204]
 *                       truck_rating:
 *                         type: number
 *                         example: 4.5
 *                       offered_price:
 *                         type: number
 *                         example: 100
 *                       time_to_reach:
 *                         type: string
 *                         example: "0d 5h 0m"
 *                       offer_updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-24T14:21:42.254Z"
 *                       client_counter_price:
 *                         type: number
 *                         nullable: true
 *                         example: 8500
 */
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
      offer_id: offer._id.toString(),
      truck_username: offer.truck_id?.user_name || "Unknown",
      truck_location: offer.truck_id?.geolocation?.coordinates || [0, 0],
      truck_rating: offer.truck_id?.rating ?? null,
      offered_price: offer.offered_price,
      time_to_reach: offer.time_to_reach,
      offer_updated_at: offer.updatedAt || null,
      client_counter_price: offer.client_counter_price ?? null,
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
