/**
 * @swagger
 * /transaction/{transactionId}/status:
 *   patch:
 *     summary: Admin updates transaction status
 *     tags: [Finance]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, failed]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

module.exports = async function updateTransactionStatus(req, res) {
  const session = await mongoose.startSession();
  try {
    const { status, note } = req.body;
    const transaction = await Transaction.findById(req.params.transactionId).session(session);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    const wallet = await Wallet.findById(transaction.wallet_id).session(session);

    session.startTransaction();

    if (transaction.status === "pending" && status === "confirmed") {
      if (transaction.type === "credit") {
        wallet.balance += transaction.amount;
      } else if (transaction.type === "debit") {
        if (wallet.balance < transaction.amount) {
          await session.abortTransaction();
          return res.status(400).json({ error: "Insufficient funds" });
        }
        wallet.balance -= transaction.amount;
      }
      wallet.last_transaction = transaction._id;
      await wallet.save({ session });
    }

    transaction.status = status;
    transaction.log.push({
      action: status,
      by: req.user.id,
      note: note || `Marked as ${status}`,
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(transaction);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: "Failed to update transaction" });
  }
};
