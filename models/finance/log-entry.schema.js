const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "created", // When user submits transaction
        "confirmed", // When admin confirms/approves or on auto-confirm
        "cancelled", // When admin/user cancels
        "reversal", // <-- Added: For commission reversal (reopen/cancel after accept)
        "cancel_refund", // <-- Added: For explicit cancel refund (if used)
      ],
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    },
  },
  { _id: false }
);

module.exports = logEntrySchema;
