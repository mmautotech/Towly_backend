const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

const {
  getBasicUserInfo,
  getBasicTruckInfo,
  UpdateRatingClient,
  UpdateRatingVehicle,
  UpdateLocationVehicle,
} = require("../controllers/user");

router.post("/user", authenticateToken, getBasicUserInfo);
router.get("/truck", authenticateToken, getBasicTruckInfo);
router.post("/client/update-rating", authenticateToken, UpdateRatingClient);
router.post("/vehicle/update-rating", authenticateToken, UpdateRatingVehicle);
router.post("/vehicle/update-location", authenticateToken, UpdateLocationVehicle);

module.exports = router;
