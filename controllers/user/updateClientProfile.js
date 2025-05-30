// controllers/user/updateClientProfile.js

const { User } = require("../../models");
const sharp = require("sharp");

/**
 * @swagger
 * tags:
 *   name: Client Profile
 *   description: Operations on the authenticated client's profile
 */

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update authenticated client's profile (requires email & phone_number)
 *     tags: [Client Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone_number
 *               - first_name
 *               - last_name
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must match the authenticated user’s email
 *               phone_number:
 *                 type: string
 *                 description: Must match the authenticated user’s phone number
 *                 example: +441234567890
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               address:
 *                 type: string
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully.
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
 *                   example: Client profile updated successfully.
 *       400:
 *         description: Missing or invalid input.
 *       401:
 *         description: Unauthorized (missing/invalid token).
 *       404:
 *         description: User not found.
 */
async function updateClientProfile(req, res, next) {
  try {
    const { email, phone_number, first_name, last_name, address } = req.body;

    // 1) Check for missing required fields
    const missing = [];
    if (!email)         missing.push("email");
    if (!phone_number)  missing.push("phone_number");
    if (!first_name)    missing.push("first_name");
    if (!last_name)     missing.push("last_name");
    if (!address)       missing.push("address");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // 2) Fetch user (only need email, phone, client_profile)
    const user = await User.findById(req.user.id).select("email phone client_profile");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // 3) Verify email & phone match
    if (email.trim() !== user.email || phone_number.trim() !== user.phone) {
      return res.status(400).json({
        success: false,
        message: "Provided email or phone number does not match authenticated user.",
      });
    }

    // 4) Initialize client_profile if missing
    if (!user.client_profile) {
      user.client_profile = {};
    }

    // 5) Apply updates
    user.client_profile.first_name = first_name;
    user.client_profile.last_name  = last_name;
    user.client_profile.address    = address;

    // 6) Handle optional profile photo
    if (req.file && req.file.buffer) {
      const original = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
      const compressedBuffer = await sharp(req.file.buffer)
        .resize({ width: 200 })
        .jpeg({ quality: 80 })
        .toBuffer();
      const compressed = {
        data: compressedBuffer,
        contentType: "image/jpeg",
      };
      user.client_profile.profile_photo = { original, compressed };
    }

    // 7) Save
    user.markModified("client_profile");
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateClientProfile };
