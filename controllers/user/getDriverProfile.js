const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /driver/profile:
 *   get:
 *     summary: Get authenticated driver's profile
 *     tags:
 *       - Driver Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile fetched
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

    const toUrl = (field) =>
      dp[field]?.data
        ? `data:${dp[field].contentType};base64,${dp[field].data.toString(
            "base64"
          )}`
        : null;

    const formatDate = (date) =>
      date
        ? new Date(date)
            .toISOString()
            .split("T")[0]
            .split("-")
            .reverse()
            .join("-")
        : "";

    sendSuccessResponse(res, "Driver profile fetched.", {
      firstName: dp.first_name || "",
      lastName: dp.last_name || "",
      dateOfBirth: formatDate(dp.date_of_birth),
      licenseNumber: dp.license_number || "",
      licenseExpiry: formatDate(dp.license_expiry),
      licenseFront: toUrl("license_front"),
      licenseBack: toUrl("license_back"),
      licenseSelfie: toUrl("license_selfie"),
    });
  } catch (err) {
    next(err);
  }
};
