// controllers/user/getVehicleProfile.js

const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { formatBase64Image } = require("../../utils/profile-helper");

/**
 * @swagger
 * /profile/vehicle:
 *   get:
 *     summary: Retrieve the authenticated vehicle profile
 *     tags:
 *       - Vehicle Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicle profile fetched successfully
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
 *                   example: Vehicle profile fetched.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 data:
 *                   type: object
 *                   required:
 *                     - registration_number
 *                     - make
 *                     - model
 *                     - color
 *                     - vehiclePhoto
 *                     - profile_photo_size
 *                   properties:
 *                     registration_number:
 *                       type: string
 *                     make:
 *                       type: string
 *                     model:
 *                       type: string
 *                     color:
 *                       type: string
 *                     vehiclePhoto:
 *                       type: string
 *                       description: Base64-encoded compressed image string
 *                     profile_photo_size:
 *                       type: integer
 *                       description: Size of the returned image in bytes
 *                     category:
 *                       type: string
 *                     wheels:
 *                       type: string
 *                     loaded:
 *                       type: string
 */
exports.getVehicleProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truck_profile.vehicle_profile"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const vp = user.truck_profile?.vehicle_profile || {};

    // choose compressed image if available, otherwise original
    const comp = vp.vehicle_photo?.compressed;
    const orig = vp.vehicle_photo?.original;
    let buffer, contentType;
    if (comp?.data) {
      buffer = comp.data;
      contentType = comp.contentType;
    } else if (orig?.data) {
      buffer = orig.data;
      contentType = orig.contentType;
    }

    const vehiclePhoto = buffer ? formatBase64Image(buffer, contentType) : "";
    const profile_photo_size = buffer ? buffer.length : 0;

    const data = {
      registration_number: vp.registration_number || "",
      make: vp.make || "",
      model: vp.model || "",
      color: vp.color || "",
      vehiclePhoto,
      profile_photo_size,
    };
    sendSuccessResponse(res, "Vehicle profile fetched.", data);
  } catch (err) {
    next(err);
  }
};
