const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

/**
 * @swagger
 * /transaction/{transactionId}/status:
 *   patch:
 *     summary: Admin updates transaction status
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled]
 *                 description: New status to assign
 *               note:
 *                 type: string
 *                 description: Optional reason or detail for action
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 transaction:
 *                   type: object
 *       400:
 *         description: Transaction already processed or bad request
 *       403:
 *         description: Forbidden, only admin can access
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error while updating transaction
 */

module.exports = async function updateTransactionStatus(req, res) {
  const session = await mongoose.startSession();
  try {
    if (!req.user || req.user.role !== 'admin') {
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
        message: "Invalid status. Use 'confirmed' or 'cancelled'."
      });
    }
    if (note && note.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Note too long (max 255 chars)."
      });
    }

    // Start transaction session early for snapshot safety
    session.startTransaction();

    // Fetch transaction (within session)
    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    if (transaction.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Transaction is already processed."
      });
    }
    if (transaction.type !== "credit") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Only credit transactions can be updated via this endpoint."
      });
    }

    const wallet = await Wallet.findById(transaction.wallet_id).session(session);
    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Associated wallet not found"
      });
    }

    if (status === "confirmed") {
      wallet.balance += transaction.amount;
      wallet.last_transaction = transaction._id;
      await wallet.save({ session });
      transaction.balanceAfter = wallet.balance;
    } else if (status === "cancelled") {
      // Cancelled: don't change wallet balance
      transaction.balanceAfter = wallet.balance;
    }

    transaction.status = status;
    transaction.log.push({
      action: status,
      by: req.user.id,
      note: note || (status === "cancelled" ? "Transaction cancelled" : "Transaction confirmed"),
    });

    await transaction.save({ session });
    await session.commitTransaction();

    const tx = transaction.toObject();
    delete tx.__v;
    if (tx.log && Array.isArray(tx.log)) {
      tx.log = tx.log.map(({ action, by, note, at }) => ({ action, by, note, at }));
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${status}`,
      transaction: tx,
    });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error("❌ Transaction update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction"
    });
  } finally {
    session.endSession();
  }
};
