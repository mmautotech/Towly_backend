const mongoose = require("mongoose");
const User = require("../../models/user");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user/settings/update:
 *   get:
 *     summary: Update user settings (client or truck)
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
 *         description: Type of settings to update
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         required: false
 *         description: Preferred UI language
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         required: false
 *         description: Preferred currency code
 *       - in: query
 *         name: distance_unit
 *         schema:
 *           type: string
 *         required: false
 *         description: Distance unit (Miles/Kilometers)
 *       - in: query
 *         name: time_format
 *         schema:
 *           type: string
 *         required: false
 *         description: Time format (12 Hour/24 Hour)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: string
 *         required: false
 *         description: Search radius value
 *     responses:
 *       200:
 *         description: Settings saved successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const normalize = (v) =>
  typeof v === "string" ? v.trim() : undefined;

const updateSettings = async (req, res) => {
  try {
    // Extract the authenticated user ID from the JWT
    const user_id = req.user.id;
    const {
      settings_type,
      language,
      currency,
      distance_unit,
      time_format,
      radius,
    } = req.query;

    // Validate settings_type
    if (!["client", "truck"].includes(settings_type)) {
      return res.status(400).json({
        success: false,
        message: "Query param 'settings_type' must be 'client' or 'truck'.",
      });
    }

    // Build a partial settings object from provided query params
    const incoming = {
      language: normalize(language),
      currency: normalize(currency),
      distance_unit: normalize(distance_unit),
      time_format: normalize(time_format),
      radius: normalize(radius),
    };
    const cleaned = Object.fromEntries(
      Object.entries(incoming).filter(([_, v]) => v != null)
    );

    if (Object.keys(cleaned).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one settings field must be provided.",
      });
    }

    // Construct the dot-path to the correct sub-document
    const settingsPath = `settings.${settings_type}_settings`;
    const result = await User.updateOne(
      { _id: user_id },
      { $set: { [settingsPath]: cleaned } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Use your shared success responder for consistency
    return sendSuccessResponse(
      res,
      `${settings_type.charAt(0).toUpperCase() + settings_type.slice(1)} settings updated.`
    );
  } catch (error) {
    console.error("Error saving user settings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving settings.",
    });
  }
};

module.exports = updateSettings;
