const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registration: String,
    make: String,
    model: String,
    year_of_manufacture: Number,
    wheels_category: {
      type: String,
      default: "Wheels Are Rolling",
    },
    vehicle_category: {
      type: String,
      default: "donot-apply",
    },
    loaded: {
      type: String,
      default: "Unloaded",
    },
  },
  { _id: false }
);

module.exports = vehicleSchema;
