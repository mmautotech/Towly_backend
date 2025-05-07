// controllers/user/updateClientProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /client/profile:
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
 *                 example: Waqas
 *               last_name:
 *                 type: string
 *                 example: Ahmed
 *               email:
 *                 type: string
 *                 format: email
 *                 example: waqas@example.com
 *               address:
 *                 type: string
 *                 example: Lahore
 *               profile_photo:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file
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
 *                 description: Base64-encoded data URL of the profile image
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
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 */
exports.updateClientProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, address } = req.body;

    const updates = {
      "client_profile.first_name": first_name,
      "client_profile.last_name": last_name,
      "client_profile.email": email,
      "client_profile.address": address || "",
    };

    if (req.file) {
      updates["client_profile.profile_photo"] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    } else if (
      typeof req.body.profile_photo === "string" &&
      req.body.profile_photo.startsWith("data:")
    ) {
      const [meta, b64] = req.body.profile_photo.split(",");
      const contentType = meta.split(";")[0].split(":")[1] || "image/jpeg";
      updates["client_profile.profile_photo"] = {
        data: Buffer.from(b64, "base64"),
        contentType,
      };
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(
      "phone client_profile.first_name client_profile.last_name client_profile.email client_profile.address client_profile.profile_photo"
    );

    if (!user || !user.client_profile) {
      return res
        .status(404)
        .json({ success: false, message: "Client profile not found" });
    }

    let photoUrl = "";
    if (user.client_profile.profile_photo?.data) {
      const b64 = user.client_profile.profile_photo.data.toString("base64");
      photoUrl = `data:${user.client_profile.profile_photo.contentType};base64,${b64}`;
    }

    sendSuccessResponse(res, "Profile updated successfully.", {
      phone: user.phone,
      first_name: user.client_profile.first_name,
      last_name: user.client_profile.last_name,
      email: user.client_profile.email,
      address: user.client_profile.address,
      profile_photo: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
