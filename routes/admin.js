const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const isAdmin = require("../middlewares/isAdmin");
const admin = require("../controllers/admin");

router.get("/user_profiles/AllClient", authenticateToken, isAdmin, admin.getAllClients);
router.get("/user_profiles/AllTrucker", authenticateToken, isAdmin, admin.getAllTrucker);
router.get("/ride-requests/getAll", authenticateToken, isAdmin, admin.getAllRideRequest);
router.get("/user_profiles/stats", authenticateToken, isAdmin, admin.getStats);
router.put("/update-phone/:userId", authenticateToken, isAdmin, admin.updateUserPhone);
router.patch("/block/:userId", authenticateToken, isAdmin, admin.updateUserStatus);

module.exports = router;
