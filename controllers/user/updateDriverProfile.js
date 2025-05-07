// controllers/user/updateDriverProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");
const { getDriverProfile } = require("./getDriverProfile");

exports.updateDriverProfile = async (req, res, next) => {
  try {
    const updates = {};
    const body = req.body;

    // text fields
    ["firstName", "lastName", "licenseNumber"].forEach((f) => {
      if (body[f]) updates[`truckProfile.driverProfile.${f}`] = body[f];
    });

    ["dateOfBirth", "licenseExpiry"].forEach((f) => {
      if (body[f])
        updates[`truckProfile.driverProfile.${f}`] = new Date(body[f]);
    });

    // images
    if (req.files?.licenseFront?.[0]) {
      updates["truckProfile.driverProfile.licenseFront"] = {
        data: req.files.licenseFront[0].buffer,
        contentType: req.files.licenseFront[0].mimetype,
      };
    }

    if (req.files?.licenseBack?.[0]) {
      updates["truckProfile.driverProfile.licenseBack"] = {
        data: req.files.licenseBack[0].buffer,
        contentType: req.files.licenseBack[0].mimetype,
      };
    }

    if (req.files?.licenseSelfie?.[0]) {
      updates["truckProfile.driverProfile.licenseSelfie"] = {
        data: req.files.licenseSelfie[0].buffer,
        contentType: req.files.licenseSelfie[0].mimetype,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return getDriverProfile(req, res, next);
  } catch (err) {
    next(err);
  }
};
