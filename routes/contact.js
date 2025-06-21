const express = require("express");
const router = express.Router();

const contact = require("../controllers/contact");
// If you have middlewares:
// const authenticateToken = require("../middlewares/authenticateToken");
// const isAdmin = require("../middlewares/isAdmin");

// Public: submit contact form
router.post("/", contact.updateContact);

// Admin: get all contact messages
// router.get("/", authenticateToken, isAdmin, contact.getContact);
router.get("/", contact.getContact); // ← Remove admin check if truly public, but usually this should be admin-only!

module.exports = router;
