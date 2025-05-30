// models/user/clientProfile.schema.js
const mongoose = require("mongoose");
const imageSchema = require("./image.schema");

const clientProfileSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    address:    { type: String, required: true },
    profile_photo: {
      original:   { type: imageSchema },
      compressed: { type: imageSchema },
    },
    rating:        { type: Number, min: 0, max: 5, default: 0 },
    ratings_count: { type: Number, default: 0 },
  },
  { _id: false }
);

module.exports = clientProfileSchema;
