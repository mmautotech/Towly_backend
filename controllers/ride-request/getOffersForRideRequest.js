const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /ride-request/offers:
 *   post:
 *     summary: Get all offers for a specific ride request (auth required)
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_id]
 *             properties:
 *               request_id:
 *                 type: string
 *                 example: "68245049f698874779869a3f"
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
 *                         example: "Ford Focus"
 *                       truck_photo:
 *                         type: string
 *                         example: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
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
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       404:
 *         description: Ride request not found
 *       500:
 *         description: Server error
 */

const getOffersForRideRequest = async (req, res, next) => {
  try {
    const user_id = req.user.id; // ✅ From JWT
    const { request_id } = req.body;

    if (!request_id) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required.",
      });
    }

    const request = await RideRequest.findOne({
      _id: new ObjectId(request_id),
      user_id: new ObjectId(user_id),
    }).populate(
      "offers.truck_id",
      "user_name rating geolocation truck_profile"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    const offers = (request.offers || [])
      .filter((offer) => offer.available === true)
      .map((offer) => {
        const truck = offer.truck_id;
        const truck_profile = truck?.truck_profile;
        const driver_profile = truck_profile?.driver_profile;
        const vehicle_profile = truck_profile?.vehicle_profile;

        let name = truck?.user_name || "Unknown";
        if (vehicle_profile?.make && vehicle_profile?.model) {
          name = `${vehicle_profile.make} ${vehicle_profile.model}`;
        } else if (driver_profile?.first_name && driver_profile?.last_name) {
          name = `${driver_profile.first_name} ${driver_profile.last_name}`;
        }

        let profile_photo = "";
        const compImg = vehicle_profile?.vehicle_photo?.compressed;
        const origImg = vehicle_profile?.vehicle_photo?.original;

        if (compImg?.data) {
          profile_photo = formatBase64Image(compImg.data, compImg.contentType);
        } else if (origImg?.data) {
          profile_photo = formatBase64Image(origImg.data, origImg.contentType);
        } else if (driver_profile?.license_selfie?.data) {
          profile_photo = formatBase64Image(
            driver_profile.license_selfie.data,
            driver_profile.license_selfie.contentType
          );
        }

        return {
          offer_id: offer._id.toString(),
          truck_username: name,
          truck_photo: profile_photo,
          truck_location: truck?.geolocation?.coordinates || [0, 0],
          truck_rating: truck?.rating ?? null,
          offered_price: offer.offered_price,
          time_to_reach: offer.time_to_reach,
          offer_updated_at: offer.updatedAt || null,
          client_counter_price: offer.client_counter_price ?? null,
        };
      });



    return res.status(200).json({
      success: true,
      message: "Offers retrieved successfully.",
      offers,
    });
  } catch (error) {
    console.error("Error in getOffersForRideRequest:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getOffersForRideRequest;
