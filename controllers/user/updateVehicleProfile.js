// controllers/user/updateVehicleProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const {
  updateProfileFields,
  formatBase64Image,
} = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile/vehicle:
 *   patch:
 *     summary: Update the authenticated vehicle profile
 *     tags:
 *       - Vehicle Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: string
 *               registration_number:
 *                 type: string
 *               category:
 *                 type: string
 *               wheels:
 *                 type: string
 *               loaded:
 *                 type: string
 *               vehiclePhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Vehicle profile updated successfully
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
 *                     make:
 *                       type: string
 *                     model:
 *                       type: string
 *                     year:
 *                       type: string
 *                     registration_number:
 *                       type: string
 *                     category:
 *                       type: string
 *                     wheels:
 *                       type: string
 *                     loaded:
 *                       type: string
 *                     vehiclePhoto:
 *                       type: string
 */
exports.updateVehicleProfile = async (req, res, next) => {
  try {
    const updates = updateProfileFields("vehicle", req.body, {
      vehiclePhoto: req.file,
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    const vp = user?.truck_profile?.vehicle_profile || {};

    sendSuccessResponse(res, "Vehicle profile updated.", {
      make: vp.make || "",
      model: vp.model || "",
      year: vp.year || "",
      registration_number: vp.registration_number || "",
      category: vp.category || "",
      wheels: vp.wheels || "",
      loaded: vp.loaded || "",
      vehiclePhoto: formatBase64Image(
        vp.vehicle_photo?.data,
        vp.vehicle_photo?.contentType
      ),
    });
  } catch (err) {
    next(err);
  }
};
