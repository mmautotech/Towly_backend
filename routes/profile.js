const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../middlewares/upload-middleware");
const validateRequest = require("../middlewares/validator-middleware");

const {
  getClientProfile,
  updateClientProfile,
  getDriverProfile,
  updateDriverProfile,
  getVehicleProfile,
  updateVehicleProfile,
} = require("../controllers/user");

const { update_client_profile_schema } = require("../validators/client-profile-validator");
const {
  update_driver_profile_schema,
  update_vehicle_profile_schema,
} = require("../validators/truck-profile-validator");

// Client
router.get("/profile", authenticateToken, getClientProfile);
router.patch("/profile", authenticateToken, upload.single("profile_photo"), validateRequest(update_client_profile_schema), updateClientProfile);

// Driver
router.get("/profile/driver", authenticateToken, getDriverProfile);
router.patch("/profile/driver", authenticateToken, upload.fields([
  { name: "license_Front", maxCount: 1 },
  { name: "license_Back", maxCount: 1 },
  { name: "license_Selfie", maxCount: 1 },
]), validateRequest(update_driver_profile_schema), updateDriverProfile);

// Vehicle
router.get("/profile/vehicle", authenticateToken, getVehicleProfile);
router.patch("/profile/vehicle", authenticateToken, upload.single("vehiclePhoto"), validateRequest(update_vehicle_profile_schema), updateVehicleProfile);

module.exports = router;
