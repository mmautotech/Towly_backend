const { Wallet, Transaction } = require("../../models/finance");

module.exports = async function updateTransactionStatus(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admins only.",
      });
    }

    const { status, note } = req.body;
    const { transactionId } = req.params;

    // Validate status
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'confirmed' or 'cancelled'.",
      });
    }
    if (note && note.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Note too long (max 255 chars).",
      });
    }

    // Fetch transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Transaction is already processed.",
      });
    }
    if (transaction.type !== "credit") {
      return res.status(400).json({
        success: false,
        message: "Only credit transactions can be updated via this endpoint.",
      });
    }

    const wallet = await Wallet.findById(transaction.wallet_id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Associated wallet not found",
      });
    }

    // Update balance and log based on status
    if (status === "confirmed") {
      wallet.balance += transaction.amount;
      wallet.last_transaction = transaction._id;
      await wallet.save();
      transaction.balanceAfter = wallet.balance;
    } else {
      transaction.balanceAfter = wallet.balance;
    }

    transaction.status = status;
    transaction.log.push({
      action: status,
      by: req.user.id,
      note:
        note ||
        (status === "cancelled"
          ? "Transaction cancelled"
          : "Transaction confirmed"),
    });

    await transaction.save();

    const tx = transaction.toObject();
    delete tx.__v;
    if (Array.isArray(tx.log)) {
      tx.log = tx.log.map(({ action, by, note, at }) => ({
        action,
        by,
        note,
        at,
      }));
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${status}`,
      transaction: tx,
    });
  } catch (err) {
    console.error("❌ Transaction update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
};
