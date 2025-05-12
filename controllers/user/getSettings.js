/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings (truck or client)
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB user ID
 *       - in: query
 *         name: settings_type
 *         schema:
 *           type: string
 *           enum: [client, truck]
 *         required: true
 *         description: Type of settings to retrieve
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
 *       400:
 *         description: Missing or invalid parameters
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
 *                   example: "Query params 'user_id' and 'settings_type' are required."
 *       404:
 *         description: Settings not found
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
 *                   example: "truck_settings not found for this user."
 *       500:
 *         description: Internal server error
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
 *                   example: "Server error while retrieving settings."
 */

const mongoose = require("mongoose");
const User = require("../../models/user");

const getSettings = async (req, res) => {
  try {
    const { user_id, settings_type } = req.query;

    // Validate input
    if (!user_id || !["client", "truck"].includes(settings_type)) {
      return res.status(400).json({
        success: false,
        message:
          "Query params 'user_id' and 'settings_type' (client/truck) are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id format.",
      });
    }

    // Fetch user
    const user = await User.findById(user_id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const key = `${settings_type}_settings`;
    const settings = user.settings?.[key];

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `${settings_type}_settings not found for this user.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error retrieving user settings:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving settings.",
    });
  }
};

module.exports = getSettings;
