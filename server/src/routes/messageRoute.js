const express = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

// routes/messageRoute.js
router.post("/messages/sendMessage", sendMessage);
router.get("/messages/:sender/:receiver/getMessages", getMessages);

module.exports = router;
