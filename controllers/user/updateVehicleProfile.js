// controllers/user/updateVehicleProfile.js

const { User } = require("../../models");
const sharp = require("sharp");

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
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.updateVehicleProfile = async (req, res) => {
  // 1) Load user
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

  // 2) Ensure nested objects
  user.truck_profile = user.truck_profile || {};
  user.truck_profile.vehicle_profile = user.truck_profile.vehicle_profile || {};
  const vp = user.truck_profile.vehicle_profile;

  // 3) Apply text updates
  ["registration_number", "make", "model", "color"].forEach((field) => {
    if (req.body[field] !== undefined) {
      vp[field] = req.body[field];
    }
  });

  // 4) Validate file presence
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please attach a file under the field name 'vehiclePhoto'.",
    });
  }

  // 5) Read buffer
  let buf;
  try {
    if (req.file.buffer) {
      buf = req.file.buffer;
    } else if (req.file.path) {
      buf = fs.readFileSync(req.file.path);
    } else {
      throw new Error("Uploaded file missing buffer and path");
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to read uploaded file: " + err.message,
    });
  }

  // 6) Store original
  const mime = req.file.mimetype;
  vp.vehicle_photo = vp.vehicle_photo || {};
  vp.vehicle_photo.original = { data: buf, contentType: mime };

  // 7) Compress via Sharp
  let compBuf;
  try {
    compBuf = await sharp(buf)
      .resize({ width: 200 })
      .jpeg({ quality: 80 })
      .toBuffer();
    vp.vehicle_photo.compressed = { data: compBuf, contentType: "image/jpeg" };
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Image compression failed: " + err.message,
    });
  }

  // 8) Save
  try {
    user.markModified("truck_profile.vehicle_profile");
    await user.save();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to save profile: " + err.message,
    });
  }

  // 9) Success
  return res.status(200).json({
    success: true,
    message: "Vehicle profile updated successfully.",
    timestamp: new Date().toISOString(),
  });
};
