// controllers/ride-request/getAppliedRide_postedRequests.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /ride-requests/applied:
 *   post:
 *     summary: Get ride requests that the truck has already applied to
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
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
 *                       updatedAt:
 *                         type: string
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
    const truckId = req.user.id;
    const truckObjectId = new ObjectId(truckId);

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
      // find the offer this truck submitted
      const offerDoc = (r.offers || []).find(o =>
        o.truck_id.toString() === truckId
      ) || {};

      // prepare offer payload
      const offer = {
        offer_id: offerDoc._id?.toString(),
        offered_price: offerDoc.offered_price,
        time_to_reach: offerDoc.time_to_reach,
        client_counter_price: offerDoc.client_counter_price ?? null,
        createdAt: offerDoc.createdAt,
        updatedAt: offerDoc.updatedAt,
      };

      // user profile
      const profile = r.user_id?.client_profile || {};
      const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
      const username = fullName || r.user_id?.user_name || "Unknown";

      // choose compressed photo if available
      let user_photo = "";
      if (profile.profile_photo?.compressed?.data) {
        user_photo = formatBase64Image(
          profile.profile_photo.compressed.data,
          profile.profile_photo.compressed.contentType
        );
      } else if (profile.profile_photo?.data) {
        user_photo = formatBase64Image(
          profile.profile_photo.data,
          profile.profile_photo.contentType
        );
      }

      return {
        request_id: r._id.toString(),
        origin_location: r.origin_location,
        dest_location: r.dest_location,
        vehicle_details: r.vehicle_details,
        pickup_date: r.pickup_date,
        updatedAt: r.updatedAt,
        username,
        user_photo,
        offer,
      };
    });

    return sendSuccessResponse(res, "Applied ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getAppliedRide_postedRequests;
