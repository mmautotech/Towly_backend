/**
 * @swagger
 * /truck:
 *   get:
 *     summary: Get basic truck info (name and profile photo)
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
 *                       example: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

const User = require("../../models/user");

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

    let name = "";
    let profile_photo = "";

    const { user_name, truck_profile } = user;
    const driver_profile = truck_profile?.driver_profile;
    const vehicle_profile = truck_profile?.vehicle_profile;

    // Prefer vehicle make + model as name
    if (vehicle_profile?.make && vehicle_profile?.model) {
      name = `${vehicle_profile.make} ${vehicle_profile.model}`;
    } else if (driver_profile?.first_name && driver_profile?.last_name) {
      name = `${driver_profile.first_name} ${driver_profile.last_name}`;
    } else {
      name = user_name || "";
    }

    // Prefer vehicle photo → then license selfie
    if (vehicle_profile?.vehicle_photo?.data) {
      profile_photo = `data:${
        vehicle_profile.vehicle_photo.content_type
      };base64,${vehicle_profile.vehicle_photo.data.toString("base64")}`;
    } else if (driver_profile?.license_selfie?.data) {
      profile_photo = `data:${
        driver_profile.license_selfie.content_type
      };base64,${driver_profile.license_selfie.data.toString("base64")}`;
    }

    return res.status(200).json({
      success: true,
      message: "Basic truck info retrieved",
      timestamp: new Date(),
      data: {
        name,
        profile_photo,
      },
    });
  } catch (error) {
    console.error("Error in getBasicTruckInfo:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getBasicTruckInfo };
