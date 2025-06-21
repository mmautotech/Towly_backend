// routes/profile.js

const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authenticateToken");
const upload = require("../middlewares/upload-middleware");
const validateRequest = require("../middlewares/validator-middleware");
const isClient = require("../middlewares/isClient");
const isTruck = require("../middlewares/isTruck");

// ✅ Unified Profile Controller (modular like admin/history)
const profile = require("../controllers/profile");

const { update_client_profile_schema } = require("../validators/client-profile-validator");
const {update_driver_profile_schema, update_vehicle_profile_schema } = require("../validators/truck-profile-validator");

// =======================
//       Client Profile
// =======================
router.get("", authenticateToken, isClient, profile.getClientProfile);
router.post("", authenticateToken, isClient, upload.single("profile_photo"),
  validateRequest(update_client_profile_schema),
  profile.updateClientProfile
);

// =======================
//       Driver Profile
// =======================
router.get("/driver", authenticateToken, isTruck, profile.getDriverProfile);
router.post("/driver", authenticateToken, isTruck,
  upload.fields([
    { name: "license_Front", maxCount: 1 },
    { name: "license_Back", maxCount: 1 },
    { name: "license_Selfie", maxCount: 1 },
  ]),
  validateRequest(update_driver_profile_schema),
  profile.updateDriverProfile
);

// =======================
//       Vehicle Profile
// =======================
router.get("/vehicle", authenticateToken, isTruck, profile.getVehicleProfile);
router.post(
  "/vehicle", authenticateToken, isTruck,
  upload.single("vehiclePhoto"),
  validateRequest(update_vehicle_profile_schema),
  profile.updateVehicleProfile
);

module.exports = router;
