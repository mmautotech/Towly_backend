/**
 * @swagger
 * /wallet/debit:
 *   post:
 *     summary: Debit 10% from wallet for accepted truck ride
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
 *               - rideId
 *               - totalFare
 *             properties:
 *               rideId:
 *                 type: string
 *               totalFare:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet debited successfully
 *       400:
 *         description: Insufficient balance or invalid input
 *       500:
 *         description: Wallet debit failed
 */
const mongoose = require("mongoose");
const { Wallet, Transaction } = require("../../models/finance");

module.exports = async function debitWallet(req, res) {
  const session = await mongoose.startSession();
  try {
    const { rideId, totalFare } = req.body;
    const userId = req.user.id;

    if (!rideId || !totalFare || isNaN(totalFare) || totalFare <= 0) {
      return res.status(400).json({ error: "Invalid rideId or totalFare" });
    }

    const deduction = parseFloat((totalFare * 0.10).toFixed(2)); // ✅ 10% fee now

    session.startTransaction();

    const wallet = await Wallet.findOne({ user_id: userId }).session(session);
    if (!wallet || wallet.balance < deduction) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient balance" });
    }

    wallet.balance -= deduction;
    wallet.last_transaction = null;
    await wallet.save({ session });

    const [transaction] = await Transaction.create(
      [{
        user_id: userId,
        wallet_id: wallet._id,
        type: "debit",
        amount: deduction,
        status: "confirmed",
        remarks: `10% deduction for ride ${rideId}`,
        log: [{
          action: "confirmed",
          by: userId,
          note: `Auto-debit for ride ${rideId}`,
        }],
      }],
      { session }
    );

    wallet.last_transaction = transaction._id;
    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Wallet debited", transaction });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Wallet debit error:", err);
    return res.status(500).json({ error: "Wallet debit failed" });
  }
};
