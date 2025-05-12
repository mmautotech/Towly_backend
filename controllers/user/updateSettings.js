/**
 * @swagger
 * /user/settings:
 *   post:
 *     summary: Save user settings (client or truck)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - settings_type
 *               - settings
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: MongoDB ObjectId of the user
 *                 example: "660f23ab238c4849313812cd"
 *               settings_type:
 *                 type: string
 *                 enum: [client, truck]
 *                 description: Type of settings to update
 *                 example: "truck"
 *               settings:
 *                 type: object
 *                 description: Object containing settings fields to update
 *                 properties:
 *                   language:
 *                     type: string
 *                     example: "English"
 *                     nullable: true
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *                     nullable: true
 *                   distance_unit:
 *                     type: string
 *                     example: "Miles"
 *                     nullable: true
 *                   time_format:
 *                     type: string
 *                     example: "24 Hour"
 *                     nullable: true
 *                   radius:
 *                     type: string
 *                     example: "25"
 *                     nullable: true
 *     responses:
 *       200:
 *         description: Settings saved successfully
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
 *                   example: "Truck settings saved successfully."
 *       400:
 *         description: Invalid input or missing fields
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
 *                   example: "user_id and settings_type are required."
 *       404:
 *         description: User not found
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
 *                   example: "User not found."
 *       500:
 *         description: Server error
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
 *                   example: "Server error while saving user settings."
 */

const mongoose = require("mongoose");
const User = require("../../models/user");
const sendSuccessResponse = require("../../utils/success-response");

const normalizeSetting = (value) =>
  typeof value === "string"
    ? value.trim()
    : Array.isArray(value)
    ? value[0]
    : value;
const updateSettings = async (req, res) => {
  try {
    const { user_id, settings_type, settings } = req.body;

    if (!user_id || !settings || !["truck", "client"].includes(settings_type)) {
      return res.status(400).json({
        success: false,
        message:
          "user_id, settings_type ('truck' or 'client'), and settings object are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_id format.",
      });
    }

    const normalizedSettings = {
      language: normalizeSetting(settings.language),
      currency: normalizeSetting(settings.currency),
      distance_unit: normalizeSetting(settings.distance_unit),
      time_format: normalizeSetting(settings.time_format),
      radius: normalizeSetting(settings.radius),
    };

    const cleanedSettings = Object.fromEntries(
      Object.entries(normalizedSettings).filter(([_, v]) => v !== undefined)
    );

    const settingsPath = `settings.${settings_type}_settings`;

    const result = await User.updateOne(
      { _id: user_id },
      { $set: { [settingsPath]: cleanedSettings } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return sendSuccessResponse(
      res,
      `${
        settings_type.charAt(0).toUpperCase() + settings_type.slice(1)
      } settings saved successfully.`
    );
  } catch (error) {
    console.error("User settings update error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving user settings.",
    });
  }
};

module.exports = updateSettings;
