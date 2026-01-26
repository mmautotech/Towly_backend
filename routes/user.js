const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// Unified user controller
const user = require("../controllers/user-info");

router.post("/basic", authenticateToken, user.getBasicInfo);
router.post("/target/update-rating", authenticateToken, user.UpdateRating);
router.post("/update-location", authenticateToken, user.UpdateLocationVehicle); // ✅ Your update location route

// Optional settings
router.get("/settings", authenticateToken, user.getSettings);
router.put("/settings", authenticateToken, user.updateSettings);

module.exports = router;
