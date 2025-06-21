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
 *       403:
 *         description: Access denied for non-client users
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getClientProfile = async (req, res, next) => {
  try {
    // 1. Only allow 'client' users to access this endpoint
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only clients can access this endpoint.",
      });
    }

    // 2. Find the client and only select required fields
    const client = await User.findById(req.user.id).select("phone email client_profile");

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const profile = client.client_profile || {};

    // 3. Handle profile photo: prefer compressed, then original
    let buffer = null;
    let contentType = null;
    if (profile.profile_photo?.compressed?.data && profile.profile_photo?.compressed?.contentType) {
      buffer = profile.profile_photo.compressed.data;
      contentType = profile.profile_photo.compressed.contentType;
    } else if (profile.profile_photo?.original?.data && profile.profile_photo?.original?.contentType) {
      buffer = profile.profile_photo.original.data;
      contentType = profile.profile_photo.original.contentType;
    }

    // 4. Format photo as Base64 data URL, or return an empty string if not present
    const photo = (buffer && contentType)
      ? formatBase64Image(buffer, contentType)
      : "";
    const photoSize = buffer ? buffer.length : 0;

    // 5. Return response with all necessary profile fields
    sendSuccessResponse(res, "Profile fetched successfully.", {
      phone: client.phone,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: client.email,
      address: profile.address || "",
      profile_photo: photo,
      profile_photo_size: photoSize,
    });
  } catch (err) {
    next(err);
  }
};
