"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import axios from "axios";

export default function ChatBoard() {
	const { userId, receiverId } = useParams();
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState("");
	const [sender, setSender] = useState(null);
	const [receiver, setReceiver] = useState(null);
	const router = useRouter();
	const scrollRef = useRef(null);
	const socketRef = useRef(null);

	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	const clearNotifications = useCallback(async () => {
		try {
			const { data } = await axios.get(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications`
			);
			const unreadFromThisUser = data.notifications.filter(
				(n) =>
					(n.sender?._id === receiverId || n.sender === receiverId) &&
					n.type === "message" &&
					!n.isRead
			);
			if (unreadFromThisUser.length > 0) {
				await Promise.all(
					unreadFromThisUser.map((n) =>
						axios.put(
							`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications/${n._id}/read`
						)
					)
				);
			}
		} catch (err) {
			console.error("Error clearing notifications:", err);
		}
	}, [userId, receiverId, NEXT_PUBLIC_API_URL]);

	const fetchUser = async (id, setUser) => {
		try {
			const response = await fetch(`${NEXT_PUBLIC_API_URL}/user/${id}`);
			const data = await response.json();
			setUser(data);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchMessages = useCallback(async () => {
		try {
			const res = await fetch(
				`${NEXT_PUBLIC_API_URL}/messages/${userId}/${receiverId}/getMessages`
			);
			const data = await res.json();
			if (data.success) setMessages(data.messages);
		} catch (error) {
			console.error(error);
		}
	}, [userId, receiverId, NEXT_PUBLIC_API_URL]);

	useEffect(() => {
		if (!userId) return;
		socketRef.current = io(NEXT_PUBLIC_API_URL, { transports: ["websocket"] });
		socketRef.current.emit("join", userId);
		socketRef.current.on("newMessage", (msg) => {
			const isFromReceiver =
				msg.sender === receiverId || msg.sender?._id === receiverId;
			const isToMe = msg.receiver === userId || msg.receiver?._id === userId;
			if (isFromReceiver && isToMe) {
				setMessages((prev) => [...prev, msg]);
				clearNotifications();
			}
		});
		return () => {
			if (socketRef.current) socketRef.current.disconnect();
		};
	}, [userId, receiverId, NEXT_PUBLIC_API_URL, clearNotifications]);

	useEffect(() => {
		fetchUser(userId, setSender);
		fetchUser(receiverId, setReceiver);
		fetchMessages();
		clearNotifications();
	}, [userId, receiverId, fetchMessages, clearNotifications]);

	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!text.trim()) return;
		try {
			const res = await fetch(`${NEXT_PUBLIC_API_URL}/messages/sendMessage`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sender: userId, receiver: receiverId, text }),
			});
			const data = await res.json();
			if (data.success) {
				setMessages((prev) => [...prev, data.data]);
				setText("");
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<main className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl overflow-auto">
			{/* Header */}
			<header className="bg-white p-4 border-b flex items-center gap-4 z-10">
				<button
					onClick={() => router.back()}
					className="p-2 hover:bg-gray-100 rounded-full transition"
				>
					❮
				</button>
				<div className="flex flex-col">
					<h1 className="font-bold text-gray-800 text-lg leading-tight">
						{receiver?.[0]?.author?.fullName || "Chat"}
					</h1>
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-2 bg-green-500 rounded-full"></span>
						<span className="text-xs text-gray-500 font-medium">Online</span>
					</div>
				</div>
			</header>

			{/* Messages Area - Ensuring proper scrolling and flex-col-reverse or normal flex-col */}
			<div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] space-y-3">
				{messages.map((msg, index) => {
					const isMe = (msg.sender?._id || msg.sender) === userId;

					return (
						/* 🔥 KEY FIX: This wrapper div takes full width and handles alignment */
						<div
							key={index}
							className={`w-full flex ${
								isMe ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`relative max-w-[80%] px-4 py-2 rounded-xl shadow-sm ${
									isMe
										? "bg-blue-600 text-white rounded-tr-none"
										: "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
								}`}
							>
								<p className="text-[15px] break-words">{msg.text}</p>
								<span
									className={`text-[10px] block mt-1 opacity-60 ${
										isMe ? "text-right" : "text-left"
									}`}
								>
									{new Date(msg.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
					);
				})}
				<div ref={scrollRef} className="pt-2" />
			</div>

			{/* Input Area */}
			<footer className="p-4 bg-white border-t">
				<form onSubmit={sendMessage} className="flex items-center gap-3">
					<div className="flex-1 bg-gray-100 rounded-2xl px-4 py-1 flex items-center border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
						<input
							type="text"
							placeholder="Type a message..."
							value={text}
							onChange={(e) => setText(e.target.value)}
							className="flex-1 bg-transparent py-2.5 focus:outline-none text-gray-700"
						/>
					</div>
					<button
						type="submit"
						disabled={!text.trim()}
						className="bg-blue-600 p-2.5 rounded-full text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:scale-100 active:scale-90 transition-all shadow-md"
					>
						<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
							<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
						</svg>
					</button>
				</form>
			</footer>
		</main>
	);
}
