const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { getDriverProfile } = require("./getDriverProfile");

/**
 * @swagger
 * /driver/profile:
 *   patch:
 *     summary: Update driver's profile
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
 *                 example: "12-12-1996"
 *                 description: Must be DD-MM-YYYY
 *               license_expiry:
 *                 type: string
 *                 example: "12-12-2031"
 *                 description: Must be DD-MM-YYYY
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
 *         description: Profile updated and returned
 */
exports.updateDriverProfile = async (req, res, next) => {
  try {
    const updates = {};
    const body = req.body;

    // Required fields
    if (body.first_name)
      updates["truck_profile.driver_profile.first_name"] = body.first_name;
    if (body.last_name)
      updates["truck_profile.driver_profile.last_name"] = body.last_name;
    if (body.license_number)
      updates["truck_profile.driver_profile.license_number"] =
        body.license_number;

    // Convert DD-MM-YYYY → Date with 00:00 UTC
    if (body.date_of_birth) {
      const [d, m, y] = body.date_of_birth.split("-");
      const dob = new Date(`${y}-${m}-${d}`);
      if (!isNaN(dob)) {
        dob.setUTCHours(0, 0, 0, 0);
        updates["truck_profile.driver_profile.date_of_birth"] = dob;
      }
    }

    if (body.license_expiry) {
      const [d, m, y] = body.license_expiry.split("-");
      const exp = new Date(`${y}-${m}-${d}`);
      if (!isNaN(exp)) {
        exp.setUTCHours(0, 0, 0, 0);
        updates["truck_profile.driver_profile.license_expiry"] = exp;
      }
    }

    // Optional images
    if (req.files?.license_Front?.[0]) {
      updates["truck_profile.driver_profile.license_front"] = {
        data: req.files.license_Front[0].buffer,
        contentType: req.files.license_Front[0].mimetype,
      };
    }
    if (req.files?.license_Back?.[0]) {
      updates["truck_profile.driver_profile.license_back"] = {
        data: req.files.license_Back[0].buffer,
        contentType: req.files.license_Back[0].mimetype,
      };
    }
    if (req.files?.license_Selfie?.[0]) {
      updates["truck_profile.driver_profile.license_selfie"] = {
        data: req.files.license_Selfie[0].buffer,
        contentType: req.files.license_Selfie[0].mimetype,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return getDriverProfile(req, res, next);
  } catch (err) {
    next(err);
  }
};
