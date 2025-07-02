const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");
const User = require("../../models/user");

module.exports = async function updateTransactionStatus(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user || req.user.role !== "admin") {
      throw new Error("Forbidden: Admins only.");
    }

    const { status, note } = req.body;
    const { transactionId } = req.params;

    if (!["confirmed", "cancelled"].includes(status)) {
      throw new Error("Invalid status. Use 'confirmed' or 'cancelled'.");
    }

    if (note && note.length > 255) {
      throw new Error("Note too long (max 255 chars).");
    }

    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "pending") {
      throw new Error("Transaction is already processed.");
    }

    if (transaction.type !== "credit") {
      throw new Error("Only credit transactions can be updated via this endpoint.");
    }

    const wallet = await Wallet.findById(transaction.wallet_id).session(session);
    if (!wallet) {
      throw new Error("Associated wallet not found");
    }

    const reserveUser = await User.findOne({ user_name: "Debit_Reserve", role: "admin" }).session(session);
    if (!reserveUser) {
      throw new Error("Debit_Reserve user not found");
    }

    const reserveWallet = await Wallet.findOne({ user_id: reserveUser._id }).session(session);
    if (!reserveWallet) {
      throw new Error("Reserve wallet not found");
    }

    if (status === "confirmed") {
      // Credit the user's wallet
      wallet.balance += transaction.amount;
      wallet.last_transaction = transaction._id;
      await wallet.save({ session });

      transaction.balanceAfter = wallet.balance;

      // Check reserve wallet balance
      if (reserveWallet.balance < transaction.amount) {
        throw new Error("Insufficient balance in reserve wallet");
      }

      // Debit the reserve wallet
      reserveWallet.balance -= transaction.amount;
      reserveWallet.last_transaction = transaction._id;
      await reserveWallet.save({ session });

      // Create matching debit transaction from reserve wallet (no ride_request_id)
      const reserveTx = new Transaction({
        user_id: reserveUser._id,
        wallet_id: reserveWallet._id,
        type: "debit",
        amount: transaction.amount,
        status: "confirmed",
        remarks: `Debit to fund credit for user ${transaction.user_id}`,
        balanceAfter: reserveWallet.balance,
        log: [{
          action: "confirmed",
          by: req.user.id,
          note: "Matched debit for user credit funding",
          at: new Date()
        }]
      });

      await reserveTx.save({ session });
    } else {
      transaction.balanceAfter = wallet.balance;
    }

    // Update transaction log and status
    transaction.status = status;
    transaction.log.push({
      action: status,
      by: req.user.id,
      note: note || (status === "cancelled" ? "Transaction cancelled" : "Transaction confirmed"),
      at: new Date()
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    const tx = transaction.toObject();
    delete tx.__v;
    if (Array.isArray(tx.log)) {
      tx.log = tx.log.map(({ action, by, note, at }) => ({ action, by, note, at }));
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${status}`,
      transaction: tx,
    });

  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    console.error("❌ Transaction update error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update transaction",
    });
  }
};
