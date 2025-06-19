const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

const {
  getHistoryClient,
  getHistoryTruck,
} = require("../controllers/ride-request");

router.get("/ride-requests/history", authenticateToken, getHistoryClient);
router.get("/ride-requests/history/truck", authenticateToken, getHistoryTruck);

module.exports = router;
