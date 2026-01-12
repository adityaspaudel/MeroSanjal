// controllers/messageController.js

const Message = require("../models/messageModel");
const { createNotification } = require("./notificationController");

let ioInstance;

const setMessageSocket = (io) => {
	ioInstance = io;
};

// ---------------- SEND MESSAGE ----------------
const sendMessage = async (req, res) => {
	try {
		const { sender, receiver, text } = req.body;

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

		const newMsg = { sender, text, createdAt: new Date() };
		conversation.messages.push(newMsg);
		await conversation.save();

		// 🔥 FIX: Change type to "message" so the dashboard recognizes it
		await createNotification({
			recipient: receiver,
			sender: sender,
			type: "message", // Updated from "comment" to "message"
			message: `${text.substring(0, 30)}${text.length > 30 ? "..." : ""}`,
		});

		if (ioInstance) {
			// Ensure we emit to the specific rooms
			ioInstance.to(sender.toString()).emit("newMessage", newMsg);
			ioInstance.to(receiver.toString()).emit("newMessage", newMsg);
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
			return res.status(200).json({ success: true, messages: [] }); // Return empty array instead of 404 for cleaner frontend handling
		}

		return res.status(200).json({
			success: true,
			messages: conversation.messages,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	sendMessage,
	getMessages,
	setMessageSocket,
};
