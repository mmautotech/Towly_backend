const mongoose = require("mongoose");
const User = require("../../models/user");

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings (client or truck only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example:
 *                     language: "English"
 *                     currency: "PKR"
 *                     distance_unit: "Kilometers"
 *                     time_format: "12 Hour"
 *                     radius: "20"
 *       403:
 *         description: Admin users do not have personal settings
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
 *                   example: Admin does not have settings.
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const getSettings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const role = req.user.role;

    // Admin users are not allowed to have settings
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin does not have settings.",
      });
    }

    const user = await User.findById(user_id).select("settings");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.settings,
    });
  } catch (error) {
    console.error("Error retrieving user settings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving settings.",
    });
  }
};

module.exports = getSettings;
