const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

/**
 * @swagger
 * /wallet/debit:
 *   post:
 *     summary: Submit a debit transaction (client only)
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50
 *               remarks:
 *                 type: string
 *                 example: "Ride payment"
 *     responses:
 *       201:
 *         description: Debit transaction successful
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
 *         description: Invalid input or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Wallet debit failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

module.exports = async function debitWallet(req, res) {
  const session = await mongoose.startSession();
  try {
    const { amount, remarks } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    session.startTransaction();

    // Find wallet for client
    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    // Create debit transaction
    const transaction = await Transaction.create([{
      user_id: userId,
      wallet_id: wallet._id,
      type: "debit",
      amount,
      remarks: remarks || null,
      log: [{
        action: "created",
        by: userId,
        note: "User debited wallet"
      }]
    }], { session });

    // Update wallet balance and last transaction
    wallet.balance -= amount;
    wallet.last_transaction = transaction[0]._id;
    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Debit transaction successful",
      transaction: transaction[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Wallet debit failed:", err);
    return res.status(500).json({
      success: false,
      message: "Wallet debit failed"
    });
  }
};
