const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

exports.updateVehicleProfile = async (req, res, next) => {
  try {
    const updates = {};
    const body = req.body;
    ["registrationNumber", "make", "model", "color"].forEach((f) => {
      if (body[f] !== undefined)
        updates[`truckProfile.vehicleProfile.${f}`] = body[f];
    });
    if (req.file) {
      updates["truckProfile.vehicleProfile.vehiclePhoto"] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
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

    return exports.getVehicleProfile(req, res, next);
  } catch (err) {
    next(err);
  }
};
