// controllers/user/index.js

const { getBasicUserInfo } = require("./getBasicUserInfo");
const { getBasicTruckInfo } = require("./getBasicTruckInfo");

// these two export the function directly:
const UpdateRatingClient = require("./UpdateRatingClient");
const UpdateRatingVehicle = require("./UpdateRatingVehicle");
const UpdateLocationVehicle = require("./UpdateLocationVehicle");

// these export object { getClientProfile, getDriverProfile, getVehicleProfile } so destructure:
const { getClientProfile } = require("./getClientProfile");
const { getDriverProfile } = require("./getDriverProfile");
const { getVehicleProfile } = require("./getVehicleProfile");

// these export object { updateClientProfile, updateDriverProfile, updateVehicleProfile}, so destructure:
const { updateClientProfile } = require("./updateClientProfile");
const { updateDriverProfile } = require("./updateDriverProfile");
const { updateVehicleProfile } = require("./updateVehicleProfile");

// these two export the function directly:
const updateSettings = require("./updateSettings");
const getSettings = require("./getSettings");

module.exports = {
  getBasicUserInfo,
  getBasicTruckInfo,
  // User Controllers
  UpdateRatingClient,
  UpdateRatingVehicle,
  UpdateLocationVehicle,

  // Profile Controllers

  // these export object { getClientProfile, getDriverProfile, getVehicleProfile } so destructure:
  getClientProfile,
  getDriverProfile,
  getVehicleProfile,

  // these export object { updateClientProfile, updateDriverProfile, updateVehicleProfile}, so destructure:
  updateDriverProfile,
  updateClientProfile,
  updateVehicleProfile,

  // Settings Controllers
  // these two export the function directly:
  updateSettings, // updateSettings (Client and Driver)
  getSettings, // getSettings (Client and Driver)
};
