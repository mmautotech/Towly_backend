const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest, User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/history/truck:
 *   get:
 *     summary: Get all ride requests this truck user has offered on
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ride requests with this truck's offers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       request_id:
 *                         type: string
 *                       ride_status:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                           label:
 *                             type: string
 *                       pickup_date:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       origin_location:
 *                         type: object
 *                       dest_location:
 *                         type: object
 *                       vehicle:
 *                         type: object
 *                       offer:
 *                         type: object
 *                         nullable: true
 */
const getHistoryTruck = async (req, res, next) => {
  try {
    // truck_id from JWT
    const truck_id = req.user.id;

    const rideRequests = await RideRequest.find({
      offers: {
        $elemMatch: { truck_id: new ObjectId(truck_id) },
      },
    })
      .populate("user_id", "user_name")
      .lean();

    const formatted = rideRequests.map((r) => {
      const offerByTruck = r.offers.find(
        (o) => o.truck_id.toString() === truck_id
      );

      const isAccepted =
        r.accepted_offer?.toString() === offerByTruck?._id?.toString();

      const offer = offerByTruck
        ? {
            offer_id: offerByTruck._id,
            offered_price: offerByTruck.offered_price,
            time_to_reach: offerByTruck.time_to_reach,
            client_counter_price: offerByTruck.client_counter_price ?? null,
            createdAt: offerByTruck.createdAt,
            updatedAt: offerByTruck.updatedAt,
            accepted: isAccepted,
            client:
              r.status === "completed" && r.user_id
                ? { name: r.user_id.user_name }
                : null,
          }
        : null;

      const ride_status = isAccepted
        ? {
            code: r.status,
            label:
              {
                completed: "Completed Ride",
                cancelled: "Cancelled Ride",
                posted: "Open Ride",
                accepted: "In Progress",
                created: "Draft",
              }[r.status] || r.status,
          }
        : {
            code: "declined",
            label: "Not Accepted",
          };

      return {
        request_id: r._id,
        ride_status,
        pickup_date: r.pickup_date,
        updatedAt: r.updatedAt,
        origin_location: r.origin_location,
        dest_location: r.dest_location,
        vehicle: r.vehicle_details,
        offer,
      };
    });

    return sendSuccessResponse(
      res,
      "Ride history for truck fetched",
      formatted
    );
  } catch (error) {
    next(error);
  }
};

module.exports = getHistoryTruck;
