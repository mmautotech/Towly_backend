// controllers/user/updateDriverProfile.js

const { User } = require("../../models");
const sharp = require("sharp");
const fs = require("fs");

/**
 * @swagger
 * /profile/driver:
 *   patch:
 *     summary: Update the authenticated driver's profile and license images
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
 *               date_of_birth:
 *                 type: string
 *                 description: Accepts ISO (`YYYY-MM-DD`) or `DD-MM-YYYY`
 *               license_number:
 *                 type: string
 *               license_expiry:
 *                 type: string
 *                 description: Accepts ISO (`YYYY-MM-DD`) or `DD-MM-YYYY`
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
 *       400:
 *         description: Bad request – invalid date or missing file
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.updateDriverProfile = async (req, res) => {
  // 1) Build the $set update object
  const set = {};

  // a) Text fields
  ["first_name", "last_name", "license_number"].forEach((f) => {
    if (req.body[f] !== undefined) {
      set[`truck_profile.driver_profile.${f}`] = req.body[f];
    }
  });

  // b) Date fields
  const toDate = (val) => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const [d, m, y] = val.split("-");
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(val);
  };
  ["date_of_birth", "license_expiry"].forEach((f) => {
    if (req.body[f] !== undefined) {
      const dt = toDate(req.body[f]);
      if (isNaN(dt)) {
        return res.status(400).json({
          success: false,
          message: `Invalid date for ${f}. Use YYYY-MM-DD or DD-MM-YYYY.`,
        });
      }
      set[`truck_profile.driver_profile.${f}`] = dt;
    }
  });

  // c) File fields
  const filesMap = {
    license_Front: "license_front",
    license_Back: "license_back",
    license_Selfie: "license_selfie",
  };

  for (const [fieldKey, propName] of Object.entries(filesMap)) {
    const arr = req.files?.[fieldKey];
    if (!arr || !arr[0]) continue;

    const file = arr[0];
    // read buffer
    let buf = file.buffer;
    if (!buf && file.path) {
      try {
        buf = fs.readFileSync(file.path);
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: `Read error on ${fieldKey}: ${e.message}`,
        });
      }
    }
    if (!buf) continue;

    // original
    set[`truck_profile.driver_profile.${propName}.original`] = {
      data: buf,
      contentType: file.mimetype,
    };

    // compressed via Sharp
    let comp;
    try {
      comp = await sharp(buf)
        .resize({ width: 200 })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: `Compression error on ${fieldKey}: ${e.message}`,
      });
    }
    set[`truck_profile.driver_profile.${propName}.compressed`] = {
      data: comp,
      contentType: "image/jpeg",
    };
  }

  // 2) Perform the update
  let updated;
  try {
    updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: set },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Update failed: " + err.message });
  }

  // 3) Success
  return res.status(200).json({
    success: true,
    message: "Driver profile updated successfully.",
    timestamp: new Date().toISOString(),
  });
};
