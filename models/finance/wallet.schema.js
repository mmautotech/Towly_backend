// models/finance/wallet.schema.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0.0,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["GBP"],
      default: "GBP",
    },
    last_transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  {
    timestamps: true,
    collection: "wallets",
  }
);

module.exports = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
