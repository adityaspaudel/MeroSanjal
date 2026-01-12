let ioInstance;

// Allow server.js to inject socket instance
const setMessageSocket = (io) => {
	ioInstance = io;
};
const { createNotification } = require("./notificationController");

const Message = require("../models/messageModel");

// ---------------- SEND MESSAGE ----------------
const sendMessage = async (req, res) => {
	try {
		const { sender, receiver, text } = req.body;

		if (!sender || !receiver || !text) {
			return res.status(400).json({ message: "All fields are required." });
		}

		// Find or create conversation
		let conversation = await Message.findOne({
			participants: { $all: [sender, receiver] },
		});

		if (!conversation) {
			conversation = new Message({
				participants: [sender, receiver],
				messages: [],
			});
		}

		const newMsg = {
			sender,
			text,
			createdAt: new Date(),
		};

		conversation.messages.push(newMsg);
		await conversation.save();
		// 🔔 CREATE MESSAGE NOTIFICATION (MINIMAL)
		await createNotification({
			recipient: receiver,
			sender: sender,
			type: "message",
			message: "You received a new message",
		});

		// -------- 🔥 EMIT SOCKET EVENT ----------------
		if (ioInstance) {
			ioInstance.to(sender).emit("newMessage", newMsg);
			ioInstance.to(receiver).emit("newMessage", newMsg);
		}

		return res.status(201).json({
			success: true,
			message: "Message sent successfully",
			data: newMsg,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

// ---------------- GET MESSAGES ----------------
const getMessages = async (req, res) => {
	try {
		const { sender, receiver } = req.params;

		const conversation = await Message.findOne({
			participants: { $all: [sender, receiver] },
		}).populate("messages.sender", "username email");

		if (!conversation) {
			return res.status(404).json({ message: "No conversation found." });
		}

		return res.status(200).json({
			success: true,
			messages: conversation.messages,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = { sendMessage, getMessages, setMessageSocket };
