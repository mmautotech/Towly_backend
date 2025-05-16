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

    // Ratings
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratings_count: { type: Number, default: 0 },
  },
  { _id: false } // ✅ prevent creation of separate _id for embedded profile
);

module.exports = client_profile_schema;
