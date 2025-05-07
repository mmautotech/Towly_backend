// models/user/clientProfile.schema.js
const mongoose = require("mongoose");
const image_schema = require("./image.schema");

const client_profile_schema = new mongoose.Schema(
  {
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    address: { type: String, default: "" },
    profile_photo: { type: image_schema },
  },
  { _id: false }
);

module.exports = client_profile_schema;
