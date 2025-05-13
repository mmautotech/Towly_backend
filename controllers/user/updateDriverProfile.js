// controllers/user/updateDriverProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const {
  updateProfileFields,
  formatBase64Image,
  formatDateString,
} = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile/driver:
 *   patch:
 *     summary: Update the authenticated driver's profile
 *     tags:
 *       - Driver Profile
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
 *               last_name:
 *                 type: string
 *               license_number:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 example: "12-12-1990"
 *               license_expiry:
 *                 type: string
 *                 example: "12-12-2030"
 *               license_Front:
 *                 type: string
 *                 format: binary
 *               license_Back:
 *                 type: string
 *                 format: binary
 *               license_Selfie:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Driver profile updated successfully
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
 *                     licenseNumber:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                     licenseExpiry:
 *                       type: string
 *                     licenseFront:
 *                       type: string
 *                     licenseBack:
 *                       type: string
 *                     licenseSelfie:
 *                       type: string
 */
exports.updateDriverProfile = async (req, res, next) => {
  try {
    const updates = updateProfileFields("driver", req.body, {
      license_Front: req.files?.license_Front?.[0],
      license_Back: req.files?.license_Back?.[0],
      license_Selfie: req.files?.license_Selfie?.[0],
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    const dp = user?.truck_profile?.driver_profile || {};

    sendSuccessResponse(res, "Driver profile updated.", {
      firstName: dp.first_name || "",
      lastName: dp.last_name || "",
      licenseNumber: dp.license_number || "",
      dateOfBirth: formatDateString(dp.date_of_birth),
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
