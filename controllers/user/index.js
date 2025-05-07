// controllers/user/index.js

// these two export the function directly:
const updateUserLocation = require("./updateUserLocation");
const updateUserRating = require("./updateUserRating");

// these export object { getClientProfile, getDriverProfile, getVehicleProfile } so destructure:
const { getClientProfile } = require("./getClientProfile");
const { getDriverProfile } = require("./getDriverProfile");
const { getVehicleProfile } = require("./getVehicleProfile");

// these export object { updateClientProfile, updateDriverProfile, updateVehicleProfile}, so destructure:
const { updateClientProfile } = require("./updateClientProfile");
const { updateDriverProfile } = require("./updateDriverProfile");
const { updateVehicleProfile } = require("./updateVehicleProfile");

module.exports = {
  updateUserLocation,
  updateUserRating,
  getClientProfile,
  updateClientProfile,
  getDriverProfile,
  updateDriverProfile,
  getVehicleProfile,
  updateVehicleProfile,
};
