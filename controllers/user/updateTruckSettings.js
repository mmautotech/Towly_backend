/**
 * @swagger
 * /ride-request/user-settings:
 *   post:
 *     summary: Save user settings like language, currency, and preferences
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [truck_id, settings]
 *             properties:
 *               truck_id:
 *                 type: string
 *                 example: "680f2325c484931381238cfd"
 *               settings:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     example: "English"
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *                   distanceUnit:
 *                     type: string
 *                     example: "Miles"
 *                   timeFormat:
 *                     type: string
 *                     example: "24 Hour"
 *                   radius:
 *                     type: string
 *                     example: "25"
 *     responses:
 *       200:
 *         description: Settings saved successfully
 *       400:
 *         description: Invalid input or missing fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const mongoose = require("mongoose");
const User = require("../../models/user");
const sendSuccessResponse = require("../../utils/success-response");

const normalizeSetting = (value) => (Array.isArray(value) ? value[0] : value);

const updateTruckSetting = async (req, res, next) => {
  try {
    const { truck_id, settings } = req.body;

    // Validate input
    if (!truck_id || !settings || typeof settings !== "object") {
      return res.status(400).json({
        success: false,
        message: "truck_id and valid settings object are required.",
      });
    }

    // Validate truck_id format
    if (!mongoose.Types.ObjectId.isValid(truck_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid truck_id format.",
      });
    }

    // Normalize settings (to ensure data integrity)
    const normalizedSettings = {
      language: normalizeSetting(settings.language),
      currency: normalizeSetting(settings.currency),
      distanceUnit: normalizeSetting(settings.distanceUnit),
      timeFormat: normalizeSetting(settings.timeFormat),
      radius: normalizeSetting(settings.radius),
    };

    // Find user and update settings
    const result = await User.updateOne(
      { truck_id },
      { $set: { settings: normalizedSettings } }
    );

    // Check if the user exists
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Return success response
    return sendSuccessResponse(res, "Settings saved successfully.");
  } catch (error) {
    console.error("Settings update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving settings.",
    });
  }
};

module.exports = updateTruckSetting;
