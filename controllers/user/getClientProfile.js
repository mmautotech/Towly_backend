// controllers/user/getClientProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /client/profile:
 *   get:
 *     summary: Retrieve the authenticated client's profile and phone
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
 */
exports.getClientProfile = async (req, res, next) => {
  try {
    const client = await User.findById(req.user.id).select(
      "phone client_profile"
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const profile = client.client_profile || {};

    let photoUrl = "";
    if (profile.profile_photo?.data) {
      const b64 = profile.profile_photo.data.toString("base64");
      photoUrl = `data:${profile.profile_photo.contentType};base64,${b64}`;
    }

    sendSuccessResponse(res, "Profile fetched successfully.", {
      user_id: client._id,
      phone: client.phone,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      address: profile.address || "",
      profile_photo: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
