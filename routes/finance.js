const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const finance = require("../controllers/finance");

// Truck Routes
router.post("/wallet/credit", authenticateToken, finance.creditWallet);
router.post("/wallet/debit", authenticateToken, finance.debitWallet);
router.get("/wallet/balance", authenticateToken, finance.getWalletBalanceByUser);
router.get("/wallet/transactions", authenticateToken, finance.getTransactionByUser);

// Admin Routes
router.patch("/transaction/:transactionId/status", authenticateToken, isAdmin, finance.updateTransactionStatus);
router.get("/admin/wallets", authenticateToken, isAdmin, finance.getWallets);
router.get("/admin/transactions", authenticateToken, isAdmin, finance.getTransactions);

module.exports = router;
