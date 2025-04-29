const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/completed:
 *   post:
 *     summary: Get ride requests that the truck has already accepted
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
 *         description: Completed ride requests returned
 */
const getcompletedRide = async (req, res, next) => {
    try {
        const { user_id } = req.body; // Get user_id from the request body or authenticated session
        if (!user_id) return next(new Error("User ID is required."));
    
        // Query to find completed requests for the logged-in user
        const requests = await RideRequest.find({
          user_id: user_id, // Filter by user_id
          status: "completed", // Filter for completed requests
        })
          .populate("user_id", "user_name") // Populate the user details (if necessary)
          .lean();
    
        const formatted = requests.map((r) => {
          const offer = (r.offers || []).find((o) => o.user_id.toString() === user_id);
    
          return {
            request_id: r._id,
            origin_location: r.origin_location,
            dest_location: r.dest_location,
            vehicle_details: r.vehicle_details,
            pickup_date: r.pickup_date,
            updatedAt: r.updatedAt,
            username: r.user_id?.user_name || "Unknown",
            status: r.status, // Include the status field
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
    
        return sendSuccessResponse(res, "Completed ride requests for user", formatted);
      } catch (error) {
        next(error);
      }
    };
module.exports = getcompletedRide;
