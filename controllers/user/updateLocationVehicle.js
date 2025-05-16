const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /vehicle/update-location:
 *   post:
 *     summary: Update the vehicle's current geolocation (longitude, latitude)
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
 *               - longitude
 *               - latitude
 *             properties:
 *               longitude:
 *                 type: number
 *                 example: 74.3587
 *               latitude:
 *                 type: number
 *                 example: 31.5204
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
 *         description: Bad request – missing or invalid coordinates
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       404:
 *         description: Vehicle not found
 *       500:
 *         description: Internal server error
 */
const UpdateLocationVehicle = async (req, res, next) => {
  const { longitude, latitude } = req.body;

  if (longitude == null || latitude == null) {
    return res.status(400).json({
      success: false,
      message: "longitude and latitude are required",
    });
  }

  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.truck_profile?.vehicle_profile) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found for this user.",
      });
    }

    user.truck_profile.vehicle_profile.geo_location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle location updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = UpdateLocationVehicle;
