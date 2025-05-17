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
 *                   example: Profile fetched successfully.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 *                       description: Base64-encoded compressed image string
 *                     profile_photo_size:
 *                       type: integer
 *                       description: Size of the returned image in bytes
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

    // choose compressed or original buffer
    let buffer;
    let contentType;
    if (profile.profile_photo?.compressed?.data) {
      buffer = profile.profile_photo.compressed.data;
      contentType = profile.profile_photo.compressed.contentType;
    } else if (profile.profile_photo?.original?.data) {
      buffer = profile.profile_photo.original.data;
      contentType = profile.profile_photo.original.contentType;
    }

    // format base64 string and measure size
    const photo = buffer ? formatBase64Image(buffer, contentType) : "";
    const photoSize = buffer ? buffer.length : 0;

    sendSuccessResponse(res, "Profile fetched successfully.", {
      user_id: client._id,
      phone: client.phone,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      address: profile.address || "",
      profile_photo: photo,
      profile_photo_size: photoSize,
    });
  } catch (err) {
    next(err);
  }
};
