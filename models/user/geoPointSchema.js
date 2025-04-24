const mongoose = require("mongoose");

const geoPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length === 2;
      },
      message: "Coordinates must be an array of [longitude, latitude]",
    },
  },
});

module.exports = geoPointSchema;
