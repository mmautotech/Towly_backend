// controllers/user/updateClientProfile.js

const { User } = require("../../models");

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update the authenticated client's profile
 *     description: >
 *       Update the authenticated client's profile fields.
 *       **First‐time setup:** `first_name`, `last_name` and `email` are required.
 *       **Subsequent updates:** any subset of profile fields may be provided.
 *       Returns only status, message, and timestamp (no profile data).
 *     tags:
 *       - Client Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile fetched successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
exports.updateClientProfile = async (req, res, next) => {
  try {
    // 1) Load the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // 2) Ensure client_profile exists
    if (!user.client_profile) {
      user.client_profile = {};
    }

    // 3) Enforce first‐time setup requirements
    const isInitialSetup =
      !user.client_profile.first_name &&
      !user.client_profile.last_name &&
      !user.client_profile.email;

    if (isInitialSetup) {
      const missing = [];
      if (!req.body.first_name) missing.push("first_name");
      if (!req.body.last_name) missing.push("last_name");
      if (!req.body.email) missing.push("email");

      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields for initial profile setup: ${missing.join(
            ", "
          )}`,
        });
      }
    }

    // 4) Apply any provided updates
    const { first_name, last_name, email, address } = req.body;
    if (first_name !== undefined) user.client_profile.first_name = first_name;
    if (last_name !== undefined) user.client_profile.last_name = last_name;
    if (email !== undefined) user.client_profile.email = email;
    if (address !== undefined) user.client_profile.address = address;

    // 5) Handle optional photo upload
    if (req.file && req.file.buffer) {
      user.client_profile.profile_photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // 6) Mark nested doc as modified & save
    user.markModified("client_profile");
    await user.save();

    // 7) Return only status, message, timestamp
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
