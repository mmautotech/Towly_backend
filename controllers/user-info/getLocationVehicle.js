const { User } = require("../../models");

const getLocationVehicle = async (req, res, next) => {
  try {
    const { driver_id } = req.params;

    const driver = await User.findById(driver_id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const location =
      driver?.truck_profile?.vehicle_profile?.geo_location || null;

    return res.status(200).json({
      success: true,
      location,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = getLocationVehicle;