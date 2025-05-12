// controllers/user/updateUserLocation.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user/update-location:
 *   post:
 *     summary: Update the user's current geolocation (longitude, latitude)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - longitude
 *               - latitude
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: MongoDB user ID
 *               longitude:
 *                 type: number
 *                 description: Longitude of the user's current location
 *               latitude:
 *                 type: number
 *                 description: Latitude of the user's current location
 *     responses:
 *       200:
 *         description: Location updated successfully
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
 *                   example: Location updated successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request – missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: user_id, longitude, and latitude are required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const updateUserLocation = async (req, res, next) => {
  const { user_id, longitude, latitude } = req.body;

  if (!user_id || longitude == null || latitude == null) {
    return res.status(400).json({
      success: false,
      message: "user_id, longitude, and latitude are required",
    });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      user_id,
      { geo_location: { type: "Point", coordinates: [longitude, latitude] } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserLocation;
