// models/finance/log-entry.schema.js
const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["created", "verified", "confirmed", "cancelled", "failed"],
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  { _id: false }
);

module.exports = logEntrySchema;
