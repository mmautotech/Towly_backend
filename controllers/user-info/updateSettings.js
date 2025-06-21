const User = require("../../models/user");
const sendSuccessResponse = require("../../utils/success-response");
const settingsSchema = require("../../validators/settingsSchema");

/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Update user settings (client or truck only)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 description: Preferred UI language
 *                 example: English
 *               currency:
 *                 type: string
 *                 description: Preferred currency code
 *                 example: PKR
 *               distance_unit:
 *                 type: string
 *                 enum: [Miles, Kilometers]
 *                 description: Distance unit
 *                 example: Kilometers
 *               time_format:
 *                 type: string
 *                 enum: ["12 Hour", "24 Hour"]
 *                 description: Time format
 *                 example: "12 Hour"
 *               radius:
 *                 type: string
 *                 description: Search radius value (number as string or number)
 *                 example: "20"
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                   example: Settings updated successfully.
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
 *                   example: Invalid input.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Admins cannot update settings
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
 *                   example: Admins do not have personal settings.
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
 *                   example: User not found.
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
 *                   example: Server error while updating settings.
 */
const updateSettings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const role = req.user.role;

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins do not have personal settings.",
      });
    }

    // Validate request body using Zod
    const parseResult = settingsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
        errors: parseResult.error.errors,
      });
    }

    const cleaned = parseResult.data;

    if (Object.keys(cleaned).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one settings field must be provided.",
      });
    }

    const result = await User.updateOne(
      { _id: user_id },
      { $set: { settings: cleaned } }
    );

    // For mongoose >=6 use matchedCount/modifiedCount, older use n/nModified
    const matched = result.matchedCount ?? result.n;
    const modified = result.modifiedCount ?? result.nModified;

    if (!matched) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!modified) {
      return res.status(200).json({
        success: true,
        message: "Settings unchanged (already up to date).",
      });
    }

    return sendSuccessResponse(res, "Settings updated successfully.");
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating settings.",
    });
  }
};

module.exports = updateSettings;
