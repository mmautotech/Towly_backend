// models/finance/log-entry.schema.js
const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "created",    // When user submits transaction
        "confirmed",  // When admin confirms/approves
        "cancelled",  // When admin/user cancels
      ],
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // user/admin who performed the action
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    note: {
      type: String,
      maxlength: 255,
    }, // optional: e.g. "Insufficient proof", "Payment received"
  },
  { _id: false }
);

module.exports = logEntrySchema;
