// models/ride-Request/offerSchema.js

const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    truck_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offered_price: {
      type: Number,
      required: true,
      min: 0,
    },
    time_to_reach: {
      type: String,
      trim: true,
      maxlength: 50,
      validate: {
        validator: (v) => v && v.length > 0,
        message: "time_to_reach is required",
      },
    },
    client_counter_price: {
      type: Number,
    },
    available: {
      type: Boolean,
      default: true,
    }

  },
  { timestamps: true }
);

module.exports = offerSchema;
