const { User } = require("../../models");
const sharp = require("sharp");

const isEmailSet = (email) => typeof email === "string" && email.trim() !== "";

exports.updateClientProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.client_profile) {
      user.client_profile = {};
    }

    const emailInDb = user.client_profile.email;
    const emailInReq = req.body.email ? req.body.email.trim() : null;

    const isInitialSetup =
      !user.client_profile.first_name &&
      !user.client_profile.last_name &&
      !isEmailSet(emailInDb);

    if (isInitialSetup) {
      const missing = [];
      if (!req.body.first_name) missing.push("first_name");
      if (!req.body.last_name) missing.push("last_name");
      if (!isEmailSet(emailInReq)) missing.push("email");
      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields for initial setup: ${missing.join(
            ", "
          )}`,
        });
      }

      user.client_profile.email = emailInReq;
    } else {
      if (
        isEmailSet(emailInReq) &&
        emailInReq !== emailInDb
      ) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be changed once set.",
        });
      }
    }

    const { first_name, last_name, address } = req.body;
    if (first_name !== undefined) user.client_profile.first_name = first_name;
    if (last_name !== undefined) user.client_profile.last_name = last_name;
    if (address !== undefined) user.client_profile.address = address;

    if (req.file && req.file.buffer) {
      const original = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };

      const compressedBuffer = await sharp(req.file.buffer)
        .resize({ width: 200 })
        .jpeg({ quality: 80 })
        .toBuffer();

      const compressed = {
        data: compressedBuffer,
        contentType: "image/jpeg",
      };

      user.client_profile.profile_photo = { original, compressed };
    }

    user.markModified("client_profile");
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Update Client Profile Error:", err);
    next(err);
  }
};
