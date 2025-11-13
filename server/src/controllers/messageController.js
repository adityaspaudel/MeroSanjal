const Message = require("../models/messageModel");

// ✅ Send or Add a Message between two users
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body; // ✅ get from body
    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let conversation = await Message.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = new Message({
        participants: [sender, receiver],
        messages: [],
      });
    }

    conversation.messages.push({ sender, text });
    await conversation.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all messages between two users
const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const conversation = await Message.findOne({
      participants: { $all: [sender, receiver] },
    }).populate("messages.sender", "username email");

    if (!conversation) {
      return res.status(404).json({ message: "No conversation found." });
    }

    res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { sendMessage, getMessages };
