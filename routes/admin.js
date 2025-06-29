const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const admin = require("../controllers/admin");


router.get("/user_profiles/stats", authenticateToken, isAdmin, admin.getStats);
router.get("/user_profiles/AllClient", authenticateToken, isAdmin, admin.getAllClients);
router.get("/user_profiles/AllTrucker", authenticateToken, isAdmin, admin.getAllTrucker);
router.get("/ride-requests/getAll", authenticateToken, isAdmin, admin.getAllRideRequest);
router.get("/wallets", authenticateToken, isAdmin, admin.getWallets);
router.get("/transactions", authenticateToken, isAdmin, admin.getTransactions);



// Admin Routes
router.put("/update-phone/:userId", authenticateToken, isAdmin, admin.updateUserPhone);
router.patch("/update-status/:userId", authenticateToken, isAdmin, admin.updateUserStatus);
router.patch("/transaction/:transactionId/status", authenticateToken, isAdmin, admin.updateTransactionStatus);

module.exports = router;
