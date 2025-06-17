/**
 * @swagger
 * /wallet/debit:
 *   post:
 *     summary: Debit 5% from wallet for accepted truck ride
 *     tags: [Finance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rideId:
 *                 type: string
 *               totalFare:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet debited successfully
 */
const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

module.exports = async function debitWallet(req, res) {
  const session = await mongoose.startSession();
  try {
    const { rideId, totalFare } = req.body;
    const userId = req.user.id;

    const deduction = parseFloat((totalFare * 0.05).toFixed(2));

    session.startTransaction();

    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    if (!wallet || wallet.balance < deduction) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient balance" });
    }

    wallet.balance -= deduction;
    await wallet.save({ session });

    const transaction = await Transaction.create(
      [{
        user_id: userId,
        wallet_id: wallet._id,
        type: "debit",
        amount: deduction,
        status: "confirmed",
        remarks: `5% deduction for ride ${rideId}`,
        log: [{
          action: "confirmed",
          by: userId,
          note: `Auto-debit for ride ${rideId}`,
        }],
      }],
      { session }
    );

    wallet.last_transaction = transaction[0]._id;
    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Wallet debited", transaction: transaction[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: "Wallet debit failed" });
  }
};
