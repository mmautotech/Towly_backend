// controllers/user/getBasicTruckInfo.js

const User = require("../../models/user");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /truck:
 *   get:
 *     summary: Get basic truck info (name, compressed profile photo, photo size, and rating)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Basic truck info retrieved
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
 *                   example: Basic truck info retrieved
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-14T10:00:00.000Z
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Ford Focus
 *                     profile_photo:
 *                       type: string
 *                       description: Base64-encoded compressed data URI of the selected image
 *                     profile_photo_size:
 *                       type: integer
 *                       description: Size of the returned image buffer in bytes
 *                     rating:
 *                       type: number
 *                       format: float
 *                       example: 4.25
 *                     ratings_count:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const getBasicTruckInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Determine display name
    const { user_name, truck_profile } = user;
    const driver_profile = truck_profile?.driver_profile;
    const vehicle_profile = truck_profile?.vehicle_profile;
    let name = "";
    if (vehicle_profile?.make && vehicle_profile?.model) {
      name = `${vehicle_profile.make} ${vehicle_profile.model}`;
    } else if (driver_profile?.first_name && driver_profile?.last_name) {
      name = `${driver_profile.first_name} ${driver_profile.last_name}`;
    } else {
      name = user_name || "";
    }

    // Pick compressed image if available, otherwise original
    const compImg = vehicle_profile?.vehicle_photo?.compressed;
    const origImg = vehicle_profile?.vehicle_photo?.original;
    let buffer, contentType;
    if (compImg?.data) {
      buffer = compImg.data;
      contentType = compImg.contentType;
    } else if (origImg?.data) {
      buffer = origImg.data;
      contentType = origImg.contentType;
    }

    // Build data URI and measure size
    const profile_photo = buffer ? formatBase64Image(buffer, contentType) : "";
    const profile_photo_size = buffer ? buffer.length : 0;

    // Include rating info
    const rating = vehicle_profile?.rating || 0;
    const ratings_count = vehicle_profile?.ratings_count || 0;

    return res.status(200).json({
      success: true,
      message: "Basic truck info retrieved",
      timestamp: new Date().toISOString(),
      data: {
        name,
        profile_photo,
        profile_photo_size,
        rating,
        ratings_count,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

module.exports = { getBasicTruckInfo };
