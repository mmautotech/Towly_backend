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
    // Admin check for defense-in-depth
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

    // Fetch transaction
    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    // Prevent double processing
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Transaction is already processed."
      });
    }

    const wallet = await Wallet.findById(transaction.wallet_id).session(session);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Associated wallet not found"
      });
    }

    session.startTransaction();

    if (status === "confirmed") {
      if (transaction.type === "credit") {
        wallet.balance += transaction.amount;
      } else if (transaction.type === "debit") {
        if (wallet.balance < transaction.amount) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "Insufficient funds"
          });
        }
        wallet.balance -= transaction.amount;
      }
      wallet.last_transaction = transaction._id;
      await wallet.save({ session });
    }

    // Update transaction
    transaction.status = status;
    transaction.log.push({
      action: status,
      by: req.user.id,
      note: note || (status === "cancelled" ? "Transaction cancelled" : "Transaction confirmed"),
    });

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Transaction ${status}`,
      transaction,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Transaction update error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update transaction"
    });
  }
};
