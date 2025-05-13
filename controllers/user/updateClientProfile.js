// controllers/user/updateClientProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const {
  updateProfileFields,
  formatBase64Image,
} = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update the authenticated client's profile (excluding phone)
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
 *         application/json:
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
 *                 description: Base64-encoded image string
 *     responses:
 *       200:
 *         description: Client profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     address:
 *                       type: string
 *                     profile_photo:
 *                       type: string
 *                       description: Base64 image string
 */
exports.updateClientProfile = async (req, res, next) => {
  try {
    const updates = updateProfileFields("client", req.body, {
      profile_photo: req.file,
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const profile = user?.client_profile;
    if (!profile)
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });

    sendSuccessResponse(res, "Profile updated successfully.", {
      phone: user.phone,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      address: profile.address,
      profile_photo: formatBase64Image(
        profile.profile_photo?.data,
        profile.profile_photo?.contentType
      ),
    });
  } catch (err) {
    next(err);
  }
};
