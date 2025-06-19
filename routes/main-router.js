const express = require("express");
const router = express.Router();

// Modular route loading
router.use("/auth", require("./auth"));
router.use("/", require("./admin.js"));
router.use("/", require("./user"));
router.use("/", require("./ride-request"));
router.use("/", require("./profile"));
router.use("/", require("./history"));
router.use("/", require("./message"));
router.use("/", require("./finance"));

module.exports = router;
