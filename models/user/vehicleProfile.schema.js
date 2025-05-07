// models/user/vehicleProfile.schema.js
const mongoose = require("mongoose");
const image_schema = require("./image.schema");

const vehicle_profile_schema = new mongoose.Schema(
  {
    registration_number: { type: String, default: "" },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    color: { type: String, default: "" },
    vehicle_photo: { type: image_schema },
  },
  { _id: false }
);

module.exports = vehicle_profile_schema;
