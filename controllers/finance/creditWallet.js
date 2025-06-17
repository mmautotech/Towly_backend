/**
 * @swagger
 * /wallet/credit:
 *   post:
 *     summary: Submit a credit transaction
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               proof_details:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction submitted
 */
const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

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
      return res.status(400).json({ error: "Invalid amount" });
    }

    session.startTransaction();
    const wallet = await getOrCreateWallet(userId);

    const transaction = await Transaction.create(
      [{
        user_id: userId,
        wallet_id: wallet._id,
        type: "credit",
        amount,
        proof_details,
        remarks,
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

    return res.status(201).json({ message: "Transaction submitted", transaction: transaction[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: "Wallet credit failed" });
  }
};
