const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

/**
 * @swagger
 * /wallet/credit:
 *   post:
 *     summary: Submit a credit transaction (truck only)
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
 *                 example: 200
 *               proof_details:
 *                 type: string
 *                 example: "Bank Transfer #12345"
 *               remarks:
 *                 type: string
 *                 example: "Weekly top-up"
 *     responses:
 *       201:
 *         description: Transaction submitted
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
 *         description: Invalid amount or input
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
 *         description: Wallet credit failed
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

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ user_id: userId });
  if (!wallet) wallet = await Wallet.create({ user_id: userId });
  return wallet;
}

module.exports = async function creditWallet(req, res) {
  const session = await mongoose.startSession();
  try {
    const { amount, proof_details, remarks } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    session.startTransaction();
    const wallet = await getOrCreateWallet(userId);

    const transaction = await Transaction.create(
      [{
        user_id: userId,
        wallet_id: wallet._id,
        type: "credit",
        amount,
        proof_details: proof_details || null,
        remarks: remarks || null,
        log: [{
          action: "created",
          by: userId,
          note: "User submitted credit request",
        }],
      }],
      { session }
    );

    await Wallet.updateOne(
      { _id: wallet._id },
      { last_transaction: transaction[0]._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Transaction submitted",
      transaction: transaction[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Wallet credit failed:", err);
    return res.status(500).json({
      success: false,
      message: "Wallet credit failed"
    });
  }
};
