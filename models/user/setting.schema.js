// models/user/setting.schema.js
const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ["English"],
    },
    currency: {
      type: String,
      enum: ["GBP", "USD", "Euro", "PKR"],
    },
    distance_unit: {
      type: String,
      enum: ["Miles", "Kilometers"],
    },
    time_format: {
      type: String,
      enum: ["24 Hour", "12 Hour"],
    },
    radius: {
      type: String,
    },
  },
  { _id: false } // don't add _id field to embedded subdocument
);

module.exports = settingSchema;
