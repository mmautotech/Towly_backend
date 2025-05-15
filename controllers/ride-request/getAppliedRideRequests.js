// controllers/ride-request/getAppliedRideRequests.js
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
/**
 * @swagger
 * /ride-requests/applied:
 *   post:
 *     summary: Get ride requests that the truck has already applied to
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [truck_id]
 *             properties:
 *               truck_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Applied ride requests returned
 */
const getAppliedRide_postedRequests = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) return next(new Error("truck_id is required."));

    const truckObjectId = new ObjectId(truck_id);

    // Find all posted requests where this truck has an offer
    const requests = await RideRequest.find({
      status: "posted",
      "offers.truck_id": truckObjectId,
    })
      .populate(
        "user_id",
        "user_name client_profile.first_name client_profile.last_name client_profile.profile_photo"
      )
      .lean();

    // For each request, pick only the matching offer
    const formatted = requests.map((r) => {
      const offer = (r.offers || []).find(
        (o) => o.truck_id.toString() === truck_id
      );

      return {
        request_id: r._id,
        origin_location: r.origin_location,
        dest_location: r.dest_location,
        vehicle_details: r.vehicle_details,
        pickup_date: r.pickup_date,
        updatedAt: r.updatedAt,
        username: r.user_id?.user_name || "Unknown",
        offer: offer
          ? {
              offer_id: offer._id,
              offered_price: offer.offered_price,
              time_to_reach: offer.time_to_reach,
              client_counter_price: offer.client_counter_price ?? null,
              createdAt: offer.createdAt,
              updatedAt: offer.updatedAt,
            }
          : null,
      };
    });

    return sendSuccessResponse(res, "Applied ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getAppliedRide_postedRequests;
