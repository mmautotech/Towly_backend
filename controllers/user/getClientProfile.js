// controllers/user/getClientProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Retrieve the authenticated client's profile
 *     tags:
 *       - Client Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile fetched successfully
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
 *                 timestamp:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
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
exports.getClientProfile = async (req, res, next) => {
  try {
    const client = await User.findById(req.user.id).select(
      "phone client_profile"
    );

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const profile = client.client_profile || {};

    sendSuccessResponse(res, "Profile fetched successfully.", {
      user_id: client._id,
      phone: client.phone,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      address: profile.address || "",
      profile_photo: formatBase64Image(
        profile.profile_photo?.data,
        profile.profile_photo?.contentType
      ),
    });
  } catch (err) {
    next(err);
  }
};
