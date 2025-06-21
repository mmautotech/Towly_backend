// controllers/profile/index.js

const { getClientProfile } = require("./getClientProfile");
const { getDriverProfile } = require("./getDriverProfile");
const { getVehicleProfile } = require("./getVehicleProfile");

const { updateClientProfile } = require("./updateClientProfile");
const { updateDriverProfile } = require("./updateDriverProfile");
const { updateVehicleProfile } = require("./updateVehicleProfile");

module.exports = {
  // Client
  getClientProfile,
  updateClientProfile,

  // Driver
  getDriverProfile,
  updateDriverProfile,

  // Vehicle
  getVehicleProfile,
  updateVehicleProfile,
};
