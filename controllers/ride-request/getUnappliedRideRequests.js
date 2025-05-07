// controllers/ride-request/getUnappliedRideRequests.js
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
/**
 * @swagger
 * /ride-requests/new:
 *   post:
 *     summary: Get ride requests that the truck has NOT yet applied to
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
 *         description: New (unapplied) ride requests returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       request_id:
 *                         type: string
 *                       origin_location:
 *                         $ref: '#/components/schemas/GeoPoint'
 *                       dest_location:
 *                         $ref: '#/components/schemas/GeoPoint'
 *                       vehicle_details:
 *                         $ref: '#/components/schemas/Vehicle'
 *                       pickup_date:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       username:
 *                         type: string
 */
const getUnappliedRide_postedRequests = async (req, res, next) => {
  try {
    const { truck_id } = req.body;
    if (!truck_id) {
      return next(new Error("truck_id is required."));
    }

    const truckObjectId = new ObjectId(truck_id);

    // Find all requests with status "posted" where this truck has NOT yet applied
    const requests = await RideRequest.find({
      status: "posted",
      offers: {
        $not: {
          $elemMatch: {
            truck_id: truckObjectId,
          },
        },
      },
    })
      .populate("user_id", "user_name")
      .lean();

    // Map to only the request details — drop other trucks' offers
    const formatted = requests.map((r) => ({
      request_id: r._id,
      origin_location: r.origin_location,
      dest_location: r.dest_location,
      vehicle_details: r.vehicle_details,
      pickup_date: r.pickup_date,
      updatedAt: r.updatedAt,
      username: r.user_id?.user_name || "Unknown",
    }));

    return sendSuccessResponse(res, "New (unapplied) ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getUnappliedRide_postedRequests;
