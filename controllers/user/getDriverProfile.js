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
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
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
 *                       description: base64 image string
 *                     licenseBack:
 *                       type: string
 *                       description: base64 image string
 *                     licenseSelfie:
 *                       type: string
 *                       description: base64 image string
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

    sendSuccessResponse(res, "Driver profile fetched.", {
      firstName: dp.first_name || "",
      lastName: dp.last_name || "",
      dateOfBirth: formatDateString(dp.date_of_birth),
      licenseNumber: dp.license_number || "",
      licenseExpiry: formatDateString(dp.license_expiry),
      licenseFront: formatBase64Image(
        dp.license_front?.data,
        dp.license_front?.contentType
      ),
      licenseBack: formatBase64Image(
        dp.license_back?.data,
        dp.license_back?.contentType
      ),
      licenseSelfie: formatBase64Image(
        dp.license_selfie?.data,
        dp.license_selfie?.contentType
      ),
    });
  } catch (err) {
    next(err);
  }
};
