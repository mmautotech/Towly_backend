// models/user/driverProfile.schema.js
const mongoose = require("mongoose");
const image_schema = require("./image.schema");

const driver_profile_schema = new mongoose.Schema(
  {
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    date_of_birth: { type: Date },
    license_number: { type: String, default: "" },
    license_expiry: { type: Date },
    license_front: { type: image_schema },
    license_back: { type: image_schema },
    license_selfie: { type: image_schema },
  },
  { _id: false }
);

module.exports = driver_profile_schema;
