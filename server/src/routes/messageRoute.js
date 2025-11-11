const express = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/message/sendMessage", sendMessage);
router.get("/:sender/:receiver", getMessages);

module.exports = router;
