const express = require("express");
const router = express.Router();

router.use("/contact", require("./contact.js"));
router.use("/auth", require("./auth"));

// admin pannel
router.use("/admin", require("./admin.js"));

// Modular route loading
router.use("/history", require("./history"));
router.use("/profile", require("./profile"));
router.use("/user", require("./user"));
router.use("/wallet", require("./finance"));

router.use("/", require("./ride-request"));

router.use("/", require("./message.js"));

module.exports = router;
