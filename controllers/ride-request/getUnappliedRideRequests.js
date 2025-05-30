// controllers/ride-request/getUnappliedRide_postedRequests.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /ride-requests/new:
 *   post:
 *     summary: Get ride requests that the truck has NOT yet applied to
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
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
 *                         example: "Waqas Ahmed"
 *                       user_photo:
 *                         type: string
 *                         example: "data:image/jpeg;base64,/9j/..."
 */
const getUnappliedRide_postedRequests = async (req, res, next) => {
  try {
    const truckObjectId = new ObjectId(req.user.id);

    const requests = await RideRequest.find({
      status: "posted",
      offers: {
        $not: {
          $elemMatch: { truck_id: truckObjectId },
        },
      },
    })
      .populate(
        "user_id",
        "user_name client_profile.first_name client_profile.last_name client_profile.profile_photo"
      )
      .lean();

    const formatted = requests.map((r) => {
      const profile = r.user_id?.client_profile || {};
      const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
      const username = fullName || r.user_id?.user_name || "Unknown";

      // choose compressed if available, otherwise original
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
        request_id:      r._id.toString(),
        origin_location: r.origin_location,
        dest_location:   r.dest_location,
        vehicle_details: r.vehicle_details,
        pickup_date:     r.pickup_date,
        updatedAt:       r.updatedAt,
        username,
        user_photo,
      };
    });

    return sendSuccessResponse(res, "New (unapplied) ride requests", formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = getUnappliedRide_postedRequests;
