// controllers/user/UpdateLocationVehicle.js

const { User } = require("../../models");

/**
 * @swagger
 * /vehicle/update-location:
 *   post:
 *     summary: Update your vehicle's current geolocation
 *     description: >
 *       Authenticate via JWT and update the calling user's own
 *       vehicle_profile.geo_location. Expects a GeoJSON Point object.
 *     tags:
 *       - Vehicle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - geo_location
 *             properties:
 *               geo_location:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     description: [longitude, latitude]
 *                     example: [74.3587, 31.5204]
 *     responses:
 *       200:
 *         description: Vehicle location updated successfully
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
 *                   example: Vehicle location updated successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request — missing or malformed geo_location
 *       401:
 *         description: Unauthorized — invalid or missing token
 *       404:
 *         description: Vehicle profile not found for this user
 */
exports.UpdateLocationVehicle = async function UpdateLocationVehicle(
  req,
  res,
  next
) {
  try {
    const { geo_location } = req.body;

    // Validate geo_location object
    if (
      !geo_location ||
      geo_location.type !== "Point" ||
      !Array.isArray(geo_location.coordinates) ||
      geo_location.coordinates.length !== 2 ||
      typeof geo_location.coordinates[0] !== "number" ||
      typeof geo_location.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "geo_location must be a GeoJSON Point with [longitude, latitude].",
      });
    }

    // Identify the caller by JWT
    const userId = req.user.id;

    // Load the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Ensure nested structures exist
    if (!user.truck_profile) {
      user.truck_profile = {};
    }
    if (!user.truck_profile.vehicle_profile) {
      user.truck_profile.vehicle_profile = {};
    }

    // Update geo_location
    user.truck_profile.vehicle_profile.geo_location = {
      type: "Point",
      coordinates: geo_location.coordinates,
    };

    // Mark modified & save
    user.markModified("truck_profile.vehicle_profile.geo_location");
    await user.save();

    // Return only status, message, timestamp
    return res.status(200).json({
      success: true,
      message: "Vehicle location updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
