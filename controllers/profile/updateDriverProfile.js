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
 *               email:
 *                 type: string
 *                 format: email
 *               phone_number:
 *                 type: string
 *                 example: "+441234567890"
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
 *       403:
 *         description: Forbidden – Only truck users allowed
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
exports.updateDriverProfile = async (req, res) => {
  // 🔐 Check role
  if (req.user.role !== "truck") {
    return res.status(403).json({
      success: false,
      message: "Only truck users can update driver profile.",
    });
  }

  // 🚩 Require and validate email and phone_number
  const { email, phone_number } = req.body;
  if (!email || !phone_number) {
    return res.status(400).json({
      success: false,
      message: "Both email and phone_number are required.",
    });
  }

  // 🔎 Fetch user to compare email/phone
  const user = await User.findById(req.user.id).select("email phone");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (
    email.trim().toLowerCase() !== user.email.toLowerCase() ||
    phone_number.trim() !== user.phone
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provided email or phone number does not match authenticated user.",
    });
  }

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

  // c) File uploads
  const filesMap = {
    license_Front: "license_front",
    license_Back: "license_back",
    license_Selfie: "license_selfie",
  };

  for (const [fieldKey, propName] of Object.entries(filesMap)) {
    const arr = req.files?.[fieldKey];
    if (!arr || !arr[0]) continue;

    const file = arr[0];
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

    // Save original
    set[`truck_profile.driver_profile.${propName}.original`] = {
      data: buf,
      contentType: file.mimetype,
    };

    // Save compressed
    try {
      const comp = await sharp(buf)
        .resize({ width: 200 })
        .jpeg({ quality: 80 })
        .toBuffer();

      set[`truck_profile.driver_profile.${propName}.compressed`] = {
        data: comp,
        contentType: "image/jpeg",
      };
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: `Compression error on ${fieldKey}: ${e.message}`,
      });
    }
  }

  // 🔄 Update in DB
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: set },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Driver profile updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Update failed: " + err.message,
    });
  }
};
