const { Wallet, Transaction } = require("../../models/finance");

/**
 * Find or create wallet for user
 */
async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ user_id: userId });
  if (!wallet) wallet = await Wallet.create({ user_id: userId });
  return wallet;
}

module.exports = async function creditWallet(req, res) {
  try {
    const { amount, proof_details, remarks } = req.body;
    const userId = req.user.id;

    // Validate amount
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

    // Validate proof details only
    if (!proof_details || proof_details.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Proof details are required.",
      });
    }

    if (proof_details.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Proof details too long (max 255 chars)",
      });
    }

    if (remarks && remarks.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Remarks too long (max 255 chars)",
      });
    }

    // Get or create wallet
    const wallet = await getOrCreateWallet(userId);

    // Create new pending transaction
    const transaction = await Transaction.create({
      user_id: userId,
      wallet_id: wallet._id,
      type: "credit",
      amount: Number(amount),
      proof_details: proof_details.trim(),
      remarks: remarks?.trim() || null,
      log: [
        {
          action: "created",
          by: userId,
          note: "User submitted credit request",
        },
      ],
      status: "pending",
      balanceAfter: wallet.balance, // No credit added yet
    });

    // Update wallet with last transaction reference
    await Wallet.updateOne(
      { _id: wallet._id },
      { last_transaction: transaction._id }
    );

    // Clean response
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

    return res.status(201).json({
      success: true,
      message: "Transaction submitted",
      transaction: tx,
    });
  } catch (err) {
    console.error("❌ Wallet credit failed:", err);
    return res.status(500).json({
      success: false,
      message: "Wallet credit failed",
    });
  }
};
