const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/applied:
 *   post:
 *     summary: Get ride requests that the truck has already applied to (auth required)
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applied ride requests returned
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
 *                         example: "Ahmed Khan"
 *                       user_photo:
 *                         type: string
 *                         example: "data:image/jpeg;base64,/9j/..."
 *                       offer:
 *                         type: object
 *                         properties:
 *                           offer_id:
 *                             type: string
 *                           offered_price:
 *                             type: number
 *                           time_to_reach:
 *                             type: string
 *                           client_counter_price:
 *                             type: number
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 */

const getAppliedRide_postedRequests = async (req, res, next) => {
  try {
    const truck_id = req.user.id; // ✅ From JWT
    const truckObjectId = new ObjectId(truck_id);

    const requests = await RideRequest.find({
      status: "posted",
      "offers.truck_id": truckObjectId,
    })
      .populate(
        "user_id",
        "user_name client_profile.first_name client_profile.last_name client_profile.profile_photo"
      )
      .lean();

    const formatted = requests.map((r) => {
      const offer = (r.offers || []).find(
        (o) => o.truck_id.toString() === truck_id
      );

      const profile = r.user_id?.client_profile || {};
      const fullName = `${profile.first_name || ""} ${
        profile.last_name || ""
      }`.trim();
      const username = fullName || r.user_id?.user_name || "Unknown";

      let user_photo = "";
      if (profile.profile_photo?.data) {
        const b64 = profile.profile_photo.data.toString("base64");
        user_photo = `data:${profile.profile_photo.contentType};base64,${b64}`;
      }

      return {
        request_id: r._id,
        origin_location: r.origin_location,
        dest_location: r.dest_location,
        vehicle_details: r.vehicle_details,
        pickup_date: r.pickup_date,
        updatedAt: r.updatedAt,
        username,
        user_photo,
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
