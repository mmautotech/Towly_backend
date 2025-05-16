// models/user/vehicleProfile.schema.js
const mongoose = require("mongoose");
const image_schema = require("./image.schema");
const geo_point_schema = require("./geoPoint.schema");

const vehicle_profile_schema = new mongoose.Schema(
  {
    registration_number: { type: String, default: "" },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    color: { type: String, default: "" },
    vehicle_photo: { type: image_schema },

    // Location of vehicle (for mapping, tracking)
    geo_location: {
      type: geo_point_schema,
      default: { type: "Point", coordinates: [0, 0] },
    },

    // Rating system
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratings_count: { type: Number, default: 0 },
  },
  { _id: false } // ✅ No need for standalone _id; embedded in User
);

module.exports = vehicle_profile_schema;
