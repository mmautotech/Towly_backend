// models/finance/log-entry.schema.js
const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["created", "confirmed", "cancelled"], // 👈 use these for traceability
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // user (admin or client) who performed the action
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: String, // ✍️ reason or comment
  },
  { _id: false }
);

module.exports = logEntrySchema;
