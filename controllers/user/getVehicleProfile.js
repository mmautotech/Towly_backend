const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /vehicle/profile:
 *   get:
 *     summary: Get the authenticated driver's vehicle profile
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
 *                 data:
 *                   type: object
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
 *                       description: Base64-encoded image (optional)
 *       404:
 *         description: User not found
 */
exports.getVehicleProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truck_profile.vehicle_profile"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const vp = user.truck_profile?.vehicle_profile || {};

    const photoUrl = vp.vehicle_photo?.data
      ? `data:${
          vp.vehicle_photo.contentType
        };base64,${vp.vehicle_photo.data.toString("base64")}`
      : null;

    sendSuccessResponse(res, "Vehicle profile fetched.", {
      registration_number: vp.registration_number || "",
      make: vp.make || "",
      model: vp.model || "",
      color: vp.color || "",
      vehiclePhoto: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
