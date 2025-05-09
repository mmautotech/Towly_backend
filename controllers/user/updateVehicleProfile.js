const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { getVehicleProfile } = require("./getVehicleProfile");

/**
 * @swagger
 * /vehicle/profile:
 *   patch:
 *     summary: Update the authenticated driver's vehicle profile
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
 *               registration_number:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               color:
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
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
exports.updateVehicleProfile = async (req, res, next) => {
  try {
    const updates = {};
    const body = req.body;

    // Match Mongoose schema field names (snake_case)
    if (body.registration_number)
      updates["truck_profile.vehicle_profile.registration_number"] =
        body.registration_number;
    if (body.make) updates["truck_profile.vehicle_profile.make"] = body.make;
    if (body.model) updates["truck_profile.vehicle_profile.model"] = body.model;
    if (body.color) updates["truck_profile.vehicle_profile.color"] = body.color;

    // Optional image
    if (req.file) {
      updates["truck_profile.vehicle_profile.vehicle_photo"] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return getVehicleProfile(req, res, next);
  } catch (err) {
    next(err);
  }
};
