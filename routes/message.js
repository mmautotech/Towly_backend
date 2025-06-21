const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");

const {
  sendMessage,
  getChat,
  markMessageRead,
  deleteMessage,
} = require("../controllers/message");

router.get("/messages", authenticateToken, getChat);
router.post("/message/send", authenticateToken, sendMessage);
router.patch("/message/read/:id", authenticateToken, markMessageRead);
router.patch("/message/delete/:id", authenticateToken, deleteMessage);

module.exports = router;
