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
 *                       description: Base64 image string
 */
exports.getVehicleProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truck_profile.vehicle_profile"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const vp = user.truck_profile?.vehicle_profile || {};

    sendSuccessResponse(res, "Vehicle profile fetched.", {
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
