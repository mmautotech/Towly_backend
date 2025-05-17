// controllers/user/getBasicUserInfo.js

const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Get client's basic profile info (name, photo, rating, and photo size)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Basic user info retrieved successfully
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
 *                   example: Basic user info retrieved.
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     profile_photo:
 *                       type: string
 *                       description: Base64-encoded compressed image string
 *                     profile_photo_size:
 *                       type: integer
 *                       description: Size of the returned image in bytes
 *                     rating:
 *                       type: number
 *                       format: float
 *                     ratings_count:
 *                       type: integer
 */
exports.getBasicUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "user_name client_profile.first_name client_profile.last_name client_profile.profile_photo client_profile.rating client_profile.ratings_count"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = user.client_profile || {};
    const fullName =
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      user.user_name;

    // choose compressed image if available, otherwise original
    let buffer;
    let contentType;
    if (profile.profile_photo?.compressed?.data) {
      buffer = profile.profile_photo.compressed.data;
      contentType = profile.profile_photo.compressed.contentType;
    }

    const photoB64 = buffer ? formatBase64Image(buffer, contentType) : "";

    const photoSize = buffer ? buffer.length : 0;

    sendSuccessResponse(res, "Basic user info retrieved.", {
      name: fullName,
      profile_photo: photoB64,
      profile_photo_size: photoSize,
      rating: profile.rating || 0,
      ratings_count: profile.ratings_count || 0,
    });
  } catch (err) {
    next(err);
  }
};
