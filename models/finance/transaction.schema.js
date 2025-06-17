// models/finance/transaction.schema.js
const mongoose = require("mongoose");
const logEntrySchema = require("./log-entry.schema");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wallet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    proof_details: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
    },
    remarks: {
      type: String,
    },
    log: [logEntrySchema],
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
