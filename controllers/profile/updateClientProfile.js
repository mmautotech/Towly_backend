const { User } = require("../../models");
const sharp = require("sharp");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

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
 *                 example: "+441234567890"
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               address:
 *                 type: string
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional. Profile photo image file.
 *     responses:
 *       200:
 *         description: Client profile updated successfully.
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
 *                     profile_photo_size:
 *                       type: integer
 *       400:
 *         description: Missing or invalid input.
 *       401:
 *         description: Unauthorized (missing/invalid token).
 *       403:
 *         description: Only clients can update this profile.
 *       404:
 *         description: User not found.
 */
async function updateClientProfile(req, res, next) {
  // console.log("REQ.BODY:", req.body);
  // console.log("REQ.FILE:", req.file);
  try {
    // Only allow clients to update
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients are allowed to update this profile.",
      });
    }

    const { email, phone_number, first_name, last_name, address } = req.body;
    const missing = [];
    if (!email) missing.push("email");
    if (!phone_number) missing.push("phone_number");
    if (!first_name) missing.push("first_name");
    if (!last_name) missing.push("last_name");
    if (!address) missing.push("address");
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`
      });
    }

    // Fetch current user
    const user = await User.findById(req.user.id).select("email phone client_profile");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Ensure identity matches authenticated user
    if (email.trim().toLowerCase() !== user.email.toLowerCase() ||
        phone_number.trim() !== user.phone) {
      return res.status(400).json({
        success: false,
        message: "Provided email or phone number does not match authenticated user."
      });
    }

    // Prepare client profile if not present
    if (!user.client_profile) {
      user.client_profile = {};
    }

    // Update fields
    user.client_profile.first_name = first_name;
    user.client_profile.last_name = last_name;
    user.client_profile.address = address;

    // Handle profile photo upload
    if (req.file && req.file.buffer) {
      // Save original
      const original = {
        data: req.file.buffer,
        contentType: req.file.mimetype || "image/jpeg"
      };
      // Save compressed (JPEG, 200px wide)
      const compressedBuffer = await sharp(req.file.buffer)
        .resize({ width: 200 })
        .jpeg({ quality: 80 })
        .toBuffer();
      const compressed = {
        data: compressedBuffer,
        contentType: "image/jpeg"
      };
      user.client_profile.profile_photo = { original, compressed };
    }

    user.markModified("client_profile");
    await user.save();

    // Build response profile
    const profile = user.client_profile || {};
    let buffer = null;
    let contentType = null;
    if (profile.profile_photo?.compressed?.data && profile.profile_photo?.compressed?.contentType) {
      buffer = profile.profile_photo.compressed.data;
      contentType = profile.profile_photo.compressed.contentType;
    } else if (profile.profile_photo?.original?.data && profile.profile_photo?.original?.contentType) {
      buffer = profile.profile_photo.original.data;
      contentType = profile.profile_photo.original.contentType;
    }
    const photo = (buffer && contentType) ? formatBase64Image(buffer, contentType) : "";
    const photoSize = buffer ? buffer.length : 0;

    // Send success response with the updated profile
    sendSuccessResponse(res, "Client profile updated successfully.", {
      user_id: user._id,
      phone: user.phone,
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: user.email,
      address: profile.address || "",
      profile_photo: photo,
      profile_photo_size: photoSize,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateClientProfile };
