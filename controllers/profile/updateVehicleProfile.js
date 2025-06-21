const { User } = require("../../models");
const sharp = require("sharp");
const fs = require("fs");

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
 *       400:
 *         description: Bad request – missing file or fields
 *       403:
 *         description: Forbidden – Only truck users allowed
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.updateVehicleProfile = async (req, res) => {
  // 🔐 Restrict to truck role
  if (req.user.role !== "truck") {
    return res.status(403).json({
      success: false,
      message: "Only truck users can update vehicle profile.",
    });
  }

  // 1. Fetch User
  let user;
  try {
    user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database error: " + err.message,
    });
  }

  // 2. Initialize profile structure
  user.truck_profile = user.truck_profile || {};
  user.truck_profile.vehicle_profile = user.truck_profile.vehicle_profile || {};
  const vp = user.truck_profile.vehicle_profile;

  // 3. Update text fields
  ["registration_number", "make", "model", "color"].forEach((f) => {
    if (req.body[f] !== undefined) {
      vp[f] = req.body[f];
    }
  });

  // 4. Validate image file
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Please attach a file under the field name 'vehiclePhoto'.",
    });
  }

  // 5. Read buffer
  let buffer;
  try {
    buffer = file.buffer || (file.path && fs.readFileSync(file.path));
    if (!buffer) throw new Error("No valid buffer found.");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to read uploaded file: " + err.message,
    });
  }

  // 6. Store original
  vp.vehicle_photo = vp.vehicle_photo || {};
  vp.vehicle_photo.original = {
    data: buffer,
    contentType: file.mimetype,
  };

  // 7. Compress image
  try {
    const compressed = await sharp(buffer)
      .resize({ width: 200 })
      .jpeg({ quality: 80 })
      .toBuffer();

    vp.vehicle_photo.compressed = {
      data: compressed,
      contentType: "image/jpeg",
    };
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Image compression failed: " + err.message,
    });
  }

  // 8. Save to DB
  try {
    user.markModified("truck_profile.vehicle_profile");
    await user.save();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to save profile: " + err.message,
    });
  }

  // ✅ Success
  return res.status(200).json({
    success: true,
    message: "Vehicle profile updated successfully.",
    timestamp: new Date().toISOString(),
  });
};
