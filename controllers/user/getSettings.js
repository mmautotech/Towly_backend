const mongoose = require("mongoose");
const User = require("../../models/user");

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings (client or truck)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       404:
 *         description: Settings not found
 *       500:
 *         description: Server error
 */
const getSettings = async (req, res) => {
  try {
    // Extract the authenticated user ID from the JWT
    const user_id = req.user.id;
    const { settings_type } = req.query;

    // Validate settings_type
    if (!["client", "truck"].includes(settings_type)) {
      return res.status(400).json({
        success: false,
        message: "Query param 'settings_type' must be 'client' or 'truck'.",
      });
    }

    // Fetch the user document
    const user = await User.findById(user_id).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Read the appropriate settings sub-document
    const key = `${settings_type}_settings`;
    const settings = user.settings?.[key];
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: `${key} not found for this user.`,
      });
    }

    // Return the settings
    return res.status(200).json({
      success: true,
      data: settings,
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
