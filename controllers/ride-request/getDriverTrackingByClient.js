const mongoose = require("mongoose");
const { RideRequest, User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/truck/tracking:
 *   get:
 *     summary: Get tracking and offer details of the accepted ride for the client
 *     tags: [RideRequest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns full tracking and truck info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 origin_location:
 *                   $ref: '#/components/schemas/GeoPoint'
 *                 dest_location:
 *                   $ref: '#/components/schemas/GeoPoint'
 *                 status:
 *                   type: string
 *                 offered_price:
 *                   type: number
 *                 truck:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     user_name:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     ratings_count:
 *                       type: number
 *                     current_location:
 *                       $ref: '#/components/schemas/GeoPoint'
 *                     driver_photo:
 *                       type: string
 *                       format: binary
 *       404:
 *         description: No accepted ride found
 *       500:
 *         description: Server error
 */
const getDriverTrackingByClient = async (req, res) => {
  try {
    const clientId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID (not a valid ObjectId)",
      });
    }

    const ride = await RideRequest.findOne({
      user_id: clientId,
      status: "accepted",
    });

    if (!ride || !ride.accepted_offer) {
      return res.status(404).json({
        success: false,
        message: "No accepted ride found for this client",
      });
    }

    const acceptedOffer = ride.offers.find(
      (offer) =>
        offer._id.toString() === ride.accepted_offer.toString()
    );

    if (!acceptedOffer || !acceptedOffer.truck_id) {
      return res.status(404).json({
        success: false,
        message: "No accepted truck offer found",
      });
    }

    const truckId = acceptedOffer.truck_id;

    const truckUser = await User.findById(truckId).select(
      "user_name truck_profile.driver_profile.first_name truck_profile.driver_profile.last_name truck_profile.driver_profile.license_selfie.compressed.data truck_profile.vehicle_profile.rating truck_profile.vehicle_profile.ratings_count truck_profile.vehicle_profile.geo_location"
    );

    if (!truckUser) {
      return res.status(404).json({
        success: false,
        message: "Truck user not found",
      });
    }

    const driverProfile = truckUser.truck_profile?.driver_profile || {};
    const vehicleProfile = truckUser.truck_profile?.vehicle_profile || {};

    const response = {
      origin_location: ride.origin_location,
      dest_location: ride.dest_location,
      status: ride.status,
      offered_price: acceptedOffer.offered_price,
      truck: {
        id: truckUser._id,
        user_name: truckUser.user_name,
        first_name: driverProfile.first_name || "",
        last_name: driverProfile.last_name || "",
        rating: vehicleProfile.rating || 0,
        ratings_count: vehicleProfile.ratings_count || 0,
        current_location: vehicleProfile.geo_location || null,
        driver_photo:
          driverProfile.license_selfie?.compressed?.data?.toString("base64") || null,
      }
    };

    return sendSuccessResponse(res, "Tracking data retrieved", response);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracking info: " + err.message,
    });
  }
};

module.exports = getDriverTrackingByClient;
