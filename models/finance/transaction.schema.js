const mongoose = require("mongoose");
const logEntrySchema = require("./log-entry.schema");

const transactionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    // For credits: allow both proof_details and image (optional)
    proof_details: { type: String, maxlength: 512 },
    proof_image_url: { type: String, maxlength: 512 },
    // For debits: require ride_request_id
    ride_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideRequest",
      required: function () { return this.type === "debit"; }
    },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    remarks: { type: String, maxlength: 255 },
    balanceAfter: { type: Number, required: true },
    log: [logEntrySchema],
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

transactionSchema.index({ user_id: 1, createdAt: 1 });
transactionSchema.index({ wallet_id: 1, createdAt: 1 });

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
