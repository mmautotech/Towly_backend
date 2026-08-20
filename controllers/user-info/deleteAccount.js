const mongoose = require("mongoose");
const { User } = require("../../models");
const RideRequest = require("../../models/ride-request");
const Notification = require("../../models/notification");
const { Wallet, Transaction } = require("../../models/finance");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /user/delete-account:
 *   delete:
 *     summary: Permanently delete the authenticated user's account and all associated data
 *     description: >
 *       Irreversibly deletes the current user's account along with their wallet,
 *       transactions, ride requests, offers made on other ride requests, and
 *       notifications. Required by App Store Review Guideline 5.1.1(v).
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account and all associated data deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Your account and all associated data have been permanently deleted.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error while deleting account.
 */
// Removes the user and every document tied to them. Accepts an optional
// mongoose session so it can run inside a transaction when supported.
const purgeUserData = async (user_id, session) => {
  const opts = session ? { session } : {};

  const deletedUser = await User.findByIdAndDelete(user_id, opts);
  if (!deletedUser) return null;

  // Wallet + transactions owned by this user
  await Wallet.deleteMany({ user_id }, opts);
  await Transaction.deleteMany({ user_id }, opts);

  // Ride requests created by this user (as a client)
  await RideRequest.deleteMany({ user_id }, opts);

  // Offers this user (as a truck) placed on other clients' ride requests
  await RideRequest.updateMany(
    { "offers.truck_id": user_id },
    { $pull: { offers: { truck_id: user_id } } },
    opts
  );

  // Notifications belonging to this user
  await Notification.deleteMany({ user_id }, opts);

  return deletedUser;
};

const deleteAccount = async (req, res) => {
  const user_id = req.user.id;

  try {
    let deletedUser = null;

    // Prefer an atomic transaction (requires a replica set, e.g. Atlas).
    // Fall back to sequential deletes on standalone MongoDB, which throws
    // a "Transaction numbers..." / IllegalOperation error.
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        deletedUser = await purgeUserData(user_id, session);
      });
    } catch (txErr) {
      const unsupported =
        txErr?.code === 20 ||
        txErr?.codeName === "IllegalOperation" ||
        /Transaction numbers|replica set|not supported/i.test(txErr?.message || "");
      if (!unsupported) throw txErr;
      // Standalone server: run without a session.
      deletedUser = await purgeUserData(user_id, null);
    } finally {
      session.endSession();
    }

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return sendSuccessResponse(
      res,
      "Your account and all associated data have been permanently deleted."
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting account.",
    });
  }
};

module.exports = deleteAccount;
