// ./history.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// ✅ use history as a namespace-style module
const history = require("../controllers/history");

router.get("/ride-requests", authenticateToken, history.getHistoryClient);
router.get("/ride-requests/truck", authenticateToken, history.getHistoryTruck);

module.exports = router;
