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
 *       403:
 *         description: Only users with the truck role can access this endpoint
 *       404:
 *         description: User not found
 */
exports.getDriverProfile = async (req, res, next) => {
  try {
    // 🚫 Restrict to truck users only
    if (req.user.role !== "truck") {
      return res.status(403).json({
        success: false,
        message: "Only users with the truck role can access driver profile.",
      });
    }

    const user = await User.findById(req.user.id).select(
      "phone email truck_profile.driver_profile"
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
      phone: user.phone || "",
      firstName: dp.first_name || "",
      lastName: dp.last_name || "",
      email: user.email || "",
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
