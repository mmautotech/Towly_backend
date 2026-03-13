const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

// ✅ Unified modular user controller
const user = require("../controllers/user-info");

router.post("/basic", authenticateToken, user.getBasicInfo);
router.post("/target/update-rating", authenticateToken, user.UpdateRating);
router.post("/update-location", authenticateToken, user.UpdateLocationVehicle);
router.get("/vehicle/location/:driver_id", authenticateToken, user.getLocationVehicle);

// Optional settings routes (if routed here)
router.get("/settings", authenticateToken, user.getSettings);
router.put("/settings", authenticateToken, user.updateSettings);


module.exports = router;
