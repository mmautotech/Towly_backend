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
 *               longitude:
 *                 type: number
 *               latitude:
 *                 type: number
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
 *       400:
 *         description: Bad request – missing or invalid fields
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
    await User.findByIdAndUpdate(user_id, {
      geolocation: { type: "Point", coordinates: [longitude, latitude] },
    });

    sendSuccessResponse(res, "Location updated successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = updateUserLocation;
