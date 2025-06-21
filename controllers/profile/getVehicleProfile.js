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
 *       403:
 *         description: Only users with the truck role can access this endpoint
 *       404:
 *         description: User not found
 */
exports.getVehicleProfile = async (req, res, next) => {
  try {
    // 🔒 Restrict to truck users only
    if (req.user.role !== "truck") {
      return res.status(403).json({
        success: false,
        message: "Only users with the truck role can access vehicle profile.",
      });
    }

    const user = await User.findById(req.user.id).select(
      "truck_profile.vehicle_profile"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const vp = user.truck_profile?.vehicle_profile || {};

    // Prefer compressed image; fallback to original
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

    sendSuccessResponse(res, "Vehicle profile fetched.", {
      registration_number: vp.registration_number || "",
      make: vp.make || "",
      model: vp.model || "",
      color: vp.color || "",
      vehiclePhoto,
      profile_photo_size,
    });
  } catch (err) {
    next(err);
  }
};
