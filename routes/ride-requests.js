const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

const {
  getUnappliedRide_postedRequests,
  getAppliedRide_postedRequests,
} = require("../controllers/ride-request");

router.get("/fetch-new", authenticateToken, getUnappliedRide_postedRequests);
router.get("/fetch-applied", authenticateToken, getAppliedRide_postedRequests);

module.exports = router;
