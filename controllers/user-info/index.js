// controllers/user-info/index.js

const getBasicInfo = require("./getBasicInfo");

const UpdateRating = require("./updateRating");
const { UpdateLocationVehicle } = require("./updateLocationVehicle");

const updateSettings = require("./updateSettings");
const getSettings = require("./getSettings");

module.exports = {
  getBasicInfo,
  UpdateRating,
  UpdateLocationVehicle,
  getSettings,
  updateSettings,
};
