const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Get client's basic profile info (name and photo)
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     profile_photo:
 *                       type: string
 */
exports.getBasicUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "user_name client_profile.profile_photo client_profile.first_name client_profile.last_name"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = user.client_profile || {};
    const fullName = `${profile.first_name || ""} ${
      profile.last_name || ""
    }`.trim();

    let photoUrl = "";
    if (profile.profile_photo?.data) {
      const b64 = profile.profile_photo.data.toString("base64");
      photoUrl = `data:${profile.profile_photo.contentType};base64,${b64}`;
    }

    sendSuccessResponse(res, "Basic user info retrieved", {
      name: fullName || user.user_name || "", // ✅ Fix here
      profile_photo: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
