const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest, User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/history:
 *   post:
 *     summary: Get completed and cancelled ride requests for a client
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: 66219f761ec2b76be761afc1
 *     responses:
 *       200:
 *         description: Completed and cancelled ride requests returned
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
 *                             example: completed
 *                           label:
 *                             type: string
 *                             example: Completed Ride
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
 *                       accepted_offer:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           offer_id:
 *                             type: string
 *                           offered_price:
 *                             type: number
 *                           time_to_reach:
 *                             type: string
 *                           client_counter_price:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                           driver_info:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               user_id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               phone:
 *                                 type: string
 */
const getHistoryClient = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return next(new Error("User ID is required."));

    const requests = await RideRequest.find({
      user_id: new ObjectId(user_id),
      status: { $in: ["completed", "cancelled"] },
    }).lean();

    const formatted = await Promise.all(
      requests.map(async (r) => {
        let acceptedOffer = null;
        let driverInfo = null;

        const statusLabels = {
          completed: "Completed Ride",
          cancelled: "Cancelled Ride",
        };

        if (r.status === "completed" && r.accepted_offer) {
          const accepted = r.offers.find(
            (o) => o._id.toString() === r.accepted_offer.toString()
          );

          if (accepted) {
            const truckUser = await User.findById(accepted.truck_id).select(
              "user_name phone"
            );
            if (truckUser) {
              driverInfo = {
                user_id: truckUser._id,
                name: truckUser.user_name,
                phone: truckUser.phone,
              };
            }

            acceptedOffer = {
              offer_id: accepted._id,
              offered_price: accepted.offered_price,
              time_to_reach: accepted.time_to_reach,
              client_counter_price: accepted.client_counter_price ?? null,
              createdAt: accepted.createdAt,
              updatedAt: accepted.updatedAt,
              driver_info: driverInfo,
            };
          }
        }

        return {
          request_id: r._id,
          ride_status: {
            code: r.status,
            label: statusLabels[r.status] || r.status,
          },
          pickup_date: r.pickup_date,
          updatedAt: r.updatedAt,
          origin_location: r.origin_location,
          dest_location: r.dest_location,
          vehicle: r.vehicle_details,
          accepted_offer: acceptedOffer,
        };
      })
    );

    return sendSuccessResponse(res, "Ride request history fetched", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getHistoryClient;
