// controllers/user/getDriverProfile.js
const { User } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

exports.getDriverProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "truckProfile.driverProfile"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const dp = user.truckProfile?.driverProfile || {};

    const toUrl = (field) =>
      dp[field]?.data
        ? `data:${dp[field].contentType};base64,${dp[field].data.toString(
            "base64"
          )}`
        : null;

    sendSuccessResponse(res, "Driver profile fetched.", {
      firstName: dp.firstName || "",
      lastName: dp.lastName || "",
      dateOfBirth: dp.dateOfBirth || null,
      licenseNumber: dp.licenseNumber || "",
      licenseExpiry: dp.licenseExpiry || null,
      licenseFront: toUrl("licenseFront"),
      licenseBack: toUrl("licenseBack"),
      licenseSelfie: toUrl("licenseSelfie"),
    });
  } catch (err) {
    next(err);
  }
};
