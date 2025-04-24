const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  Registration: String,
  make: String,
  Model: String,
  Yearofmanufacture: Number,
  Wheels_category: {
    type: String,
    default: "rolling",
  },
  vehicle_category: {
    type: String,
    default: "donot-apply",
  },
  loaded: {
    type: String,
    default: "donot-apply",
  },
});

module.exports = vehicleSchema;
