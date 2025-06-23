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
 *               proof_image_url:
 *                 type: string
 *                 example: "https://files.myapp.com/uploads/proof123.jpg"
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

/**
 * Find or create wallet for user
 */
async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ user_id: userId });
  if (!wallet) wallet = await Wallet.create({ user_id: userId });
  return wallet;
}

module.exports = async function creditWallet(req, res) {
  const session = await mongoose.startSession();
  try {
    const { amount, proof_details, proof_image_url, remarks } = req.body;
    const userId = req.user.id;

    // Validation
    if (
      amount === undefined ||
      amount === null ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (Number(amount) > 1_000_000) {
      return res.status(400).json({
        success: false,
        message: "Amount too large",
      });
    }

    // At least one proof required, and not empty string
    const hasProofDetails = proof_details && proof_details.trim() !== "";
    const hasProofImageUrl = proof_image_url && proof_image_url.trim() !== "";
    if (!hasProofDetails && !hasProofImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Proof details or proof image is required.",
      });
    }
    if (hasProofDetails && proof_details.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Proof details too long (max 255 chars)",
      });
    }
    if (hasProofImageUrl && proof_image_url.length > 512) {
      return res.status(400).json({
        success: false,
        message: "Proof image URL too long (max 512 chars)",
      });
    }
    if (remarks && remarks.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Remarks too long (max 255 chars)",
      });
    }

    session.startTransaction();

    // Find or create wallet for user
    const wallet = await getOrCreateWallet(userId);

    // Transaction: balanceAfter is current balance (not updated until admin approves/updates status)
    const transaction = await Transaction.create(
      [
        {
          user_id: userId,
          wallet_id: wallet._id,
          type: "credit",
          amount: Number(amount),
          proof_details: hasProofDetails ? proof_details : null,
          proof_image_url: hasProofImageUrl ? proof_image_url : null,
          remarks: remarks || null,
          log: [
            {
              action: "created",
              by: userId,
              note: "User submitted credit request",
            },
          ],
          status: "pending",
          balanceAfter: wallet.balance, // NOT incremented yet
        },
      ],
      { session }
    );

    // Update wallet's last_transaction reference
    await Wallet.updateOne(
      { _id: wallet._id },
      { last_transaction: transaction[0]._id },
      { session }
    );

    await session.commitTransaction();

    // Clean up response
    const tx = transaction[0].toObject();
    delete tx.__v;
    if (tx.log && Array.isArray(tx.log)) {
      tx.log = tx.log.map(({ action, by, note, at }) => ({
        action, by, note, at,
      }));
    }

    return res.status(201).json({
      success: true,
      message: "Transaction submitted",
      transaction: tx,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Wallet credit failed:", err);
    return res.status(500).json({
      success: false,
      message: "Wallet credit failed",
    });
  } finally {
    session.endSession();
  }
};
