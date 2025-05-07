// models/user/geoPoint.schema.js
const mongoose = require("mongoose");

const geo_point_schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [ longitude, latitude ]
      required: true,
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false }
);

module.exports = geo_point_schema;
