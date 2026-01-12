"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

const ChatBox = () => {
	const { userId, chatUserId } = useParams(); // userId = current user, chatUserId = chat partner
	const [messages, setMessages] = useState([]);
	const [newMsg, setNewMsg] = useState("");
	const [loading, setLoading] = useState(true);
	const socketRef = useRef(null);
	const messagesEndRef = useRef(null);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	// ---------------- SCROLL TO BOTTOM ----------------
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// ---------------- FETCH MESSAGES ----------------
	const fetchMessages = async () => {
		try {
			const { data } = await axios.get(
				`${NEXT_PUBLIC_API_URL}/messages/${userId}/${chatUserId}/getMessages`
			);
			setMessages(data.messages);
		} catch (err) {
			console.error("Error fetching messages", err);
		} finally {
			setLoading(false);
		}
	};

	// ---------------- MARK MESSAGES AS READ ----------------
	const markMessagesAsRead = async () => {
		try {
			await axios.post(
				`${NEXT_PUBLIC_API_URL}/messages/${chatUserId}/markRead`,
				{
					userId, // current user
				}
			);
			console.log("Messages marked as read");
		} catch (err) {
			console.error("Failed to mark messages as read", err);
		}
	};

	// ---------------- SOCKET.IO SETUP ----------------
	useEffect(() => {
		socketRef.current = io(NEXT_PUBLIC_API_URL, { transports: ["websocket"] });
		socketRef.current.emit("join", userId);

		socketRef.current.on("newMessage", (msg) => {
			// Only update messages if the new message is for this conversation
			if (
				(msg.sender === chatUserId && msg.receiver === userId) ||
				(msg.sender === userId && msg.receiver === chatUserId)
			) {
				setMessages((prev) => [...prev, msg]);
			}
		});

		return () => socketRef.current.disconnect();
	}, [userId, chatUserId]);

	// ---------------- INITIAL LOAD ----------------
	useEffect(() => {
		fetchMessages();
		markMessagesAsRead();
	}, [userId, chatUserId]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// ---------------- SEND MESSAGE ----------------
	const handleSendMessage = async () => {
		if (!newMsg.trim()) return;

		try {
			const { data } = await axios.post(
				`${NEXT_PUBLIC_API_URL}/messages/sendMessage`,
				{
					sender: userId,
					receiver: chatUserId,
					text: newMsg,
				}
			);

			// Emit via socket
			socketRef.current.emit("sendMessage", data.data);

			setMessages((prev) => [...prev, data.data]);
			setNewMsg("");
		} catch (err) {
			console.error("Failed to send message", err);
		}
	};

	if (loading) {
		return <div className="p-4 text-gray-500">Loading chat...</div>;
	}

	return (
		<div className="flex flex-col h-full max-w-md mx-auto border rounded shadow">
			{/* Messages List */}
			<div className="flex-1 overflow-auto p-4 space-y-2">
				{messages.map((msg, index) => (
					<div
						key={index}
						className={`flex ${
							msg.sender === userId ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`p-2 rounded-lg max-w-xs ${
								msg.sender === userId
									? "bg-green-500 text-white"
									: "bg-gray-200 text-black"
							}`}
						>
							{msg.text}
							<div className="text-xs text-gray-300 mt-1 text-right">
								{new Date(msg.createdAt).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					</div>
				))}
				<div ref={messagesEndRef}></div>
			</div>

			{/* Input */}
			<div className="flex p-2 border-t gap-2">
				<input
					type="text"
					value={newMsg}
					onChange={(e) => setNewMsg(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 border rounded px-3 py-2 focus:outline-none"
					onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
				/>
				<button
					onClick={handleSendMessage}
					className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatBox;
