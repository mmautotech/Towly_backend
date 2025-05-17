// controllers/user/getDriverProfile.js

const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const {
  formatBase64Image,
  formatDateString,
} = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile/driver:
 *   get:
 *     summary: Retrieve the authenticated driver's profile
 *     tags:
 *       - Driver Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile fetched successfully
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
 *                   example: Driver profile fetched.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       example: "12-12-1996"
 *                     licenseNumber:
 *                       type: string
 *                     licenseExpiry:
 *                       type: string
 *                       example: "12-12-2031"
 *                     licenseFront:
 *                       type: string
 *                       description: Base64-encoded compressed image string
 *                     licenseFrontSize:
 *                       type: integer
 *                       description: Size in bytes of the returned image
 *                     licenseBack:
 *                       type: string
 *                       description: Base64-encoded compressed image string
 *                     licenseBackSize:
 *                       type: integer
 *                       description: Size in bytes of the returned image
 *                     licenseSelfie:
 *                       type: string
 *                       description: Base64-encoded compressed image string
 *                     licenseSelfieSize:
 *                       type: integer
 *                       description: Size in bytes of the returned image
 */
exports.getDriverProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truck_profile.driver_profile"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const dp = user.truck_profile?.driver_profile || {};

    // helper to pick compressed over original, format and size
    const pickImage = (field) => {
      const comp = field?.compressed;
      const orig = field?.original;
      let buffer, contentType;
      if (comp?.data) {
        buffer = comp.data;
        contentType = comp.contentType;
      } else if (orig?.data) {
        buffer = orig.data;
        contentType = orig.contentType;
      }
      return {
        b64: buffer ? formatBase64Image(buffer, contentType) : "",
        size: buffer ? buffer.length : 0,
      };
    };

    const front = pickImage(dp.license_front);
    const back = pickImage(dp.license_back);
    const selfie = pickImage(dp.license_selfie);

    sendSuccessResponse(res, "Driver profile fetched.", {
      firstName: dp.first_name || "",
      lastName: dp.last_name || "",
      dateOfBirth: formatDateString(dp.date_of_birth),
      licenseNumber: dp.license_number || "",
      licenseExpiry: formatDateString(dp.license_expiry),
      licenseFront: front.b64,
      licenseFrontSize: front.size,
      licenseBack: back.b64,
      licenseBackSize: back.size,
      licenseSelfie: selfie.b64,
      licenseSelfieSize: selfie.size,
    });
  } catch (err) {
    next(err);
  }
};
