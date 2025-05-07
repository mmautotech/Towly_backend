const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

exports.getVehicleProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truckProfile.vehicleProfile"
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const vp = user.truckProfile?.vehicleProfile || {};
    const photoUrl = vp.vehiclePhoto?.data
      ? `data:${
          vp.vehiclePhoto.contentType
        };base64,${vp.vehiclePhoto.data.toString("base64")}`
      : null;

    sendSuccessResponse(res, "Vehicle profile fetched.", {
      registrationNumber: vp.registrationNumber,
      make: vp.make,
      model: vp.model,
      color: vp.color,
      vehiclePhoto: photoUrl,
    });
  } catch (err) {
    next(err);
  }
};
