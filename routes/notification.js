const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const Notification = require("../models/notification");
const mongoose = require("mongoose");

// GET: List notifications for logged-in user (optional ?unread=true)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const filter = { user_id: req.user._id }; // <--- FIXED
    if (req.query.unread === "true") {
      filter.read = false;
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: err.message,
    });
  }
});

// PATCH: Mark a single notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid notification id" });
  }
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user._id }, // <--- FIXED
      { read: true },
      { new: true }
    );
    if (!notif) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: err.message,
    });
  }
});

module.exports = router;
