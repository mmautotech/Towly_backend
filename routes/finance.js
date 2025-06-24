const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const isTruck = require("../middlewares/isTruck");
const finance = require("../controllers/finance");

// Only TRUCK users can credit/view wallet/transactions
router.post("/credit", authenticateToken, isTruck, finance.creditWallet);
router.get("/balance", authenticateToken, isTruck, finance.getWalletBalanceByUser);
router.get("/transactions", authenticateToken, isTruck, finance.getTransactionByUser);

module.exports = router;
