"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";

// --- Skeleton Component for individual rows ---
const MessageSkeleton = () => (
	<div className="flex items-center gap-4 p-3 rounded-xl border-2 border-transparent bg-gray-50 animate-pulse">
		<div className="h-[55px] w-[55px] bg-gray-200 rounded-full" />
		<div className="flex-1 space-y-2">
			<div className="h-4 bg-gray-200 rounded w-1/3" />
			<div className="h-3 bg-gray-200 rounded w-2/3" />
		</div>
	</div>
);

const UserMessageDashboard = () => {
	const { userId } = useParams();
	const [userDetails, setUserDetails] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const socketRef = useRef(null);
	const router = useRouter();
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	const fetchNotifications = useCallback(async () => {
		try {
			const { data } = await axios.get(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications`
			);
			setNotifications(data.notifications);
		} catch (err) {
			console.error("Error fetching notifications", err);
		}
	}, [userId, NEXT_PUBLIC_API_URL]);

	useEffect(() => {
		if (!userId) return;
		const io = require("socket.io-client");
		socketRef.current = io(NEXT_PUBLIC_API_URL, { transports: ["websocket"] });

		socketRef.current.emit("join", userId);

		socketRef.current.on("newNotification", (data) => {
			if (data.notification.type === "message") {
				setNotifications((prev) => [data.notification, ...prev]);
			}
		});

		return () => socketRef.current.disconnect();
	}, [userId, NEXT_PUBLIC_API_URL]);

	const handleOpenChat = async (friendId) => {
		const unreadFromFriend = notifications.filter(
			(n) =>
				(n.sender._id === friendId || n.sender === friendId) &&
				n.type === "message" &&
				!n.isRead
		);

		if (unreadFromFriend.length > 0) {
			try {
				// Optimized: Ideally you'd have a single "mark all from sender as read" endpoint
				await Promise.all(
					unreadFromFriend.map((notif) =>
						axios.put(
							`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications/${notif._id}/read`
						)
					)
				);

				setNotifications((prev) =>
					prev.map((n) =>
						(n.sender._id === friendId || n.sender === friendId) &&
						n.type === "message"
							? { ...n, isRead: true }
							: n
					)
				);
			} catch (err) {
				console.error("Failed to clear notifications:", err);
			}
		}
	};

	const getUserDetails = useCallback(async () => {
		try {
			const response = await fetch(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/getFollowingFriendsList`
			);
			const data = await response.json();
			setUserDetails(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [userId, NEXT_PUBLIC_API_URL]);

	useEffect(() => {
		getUserDetails();
		fetchNotifications();
	}, [getUserDetails, fetchNotifications]);

	return (
		<main className="h-screen bg-white text-black p-6 max-w-xl mx-auto rounded-sm  overflow-auto ">
			<div className="flex items-start text-2xl font-bold w-full mb-4">
				<span
					onClick={() => router.back()}
					className="hover:bg-slate-100 h-8 w-8 cursor-pointer text-center rounded-2xl flex items-center justify-center transition"
				>
					❮
				</span>
			</div>
			<div className="text-2xl font-bold mb-6">Messages</div>

			<div className="flex flex-col gap-3">
				{loading
					? /* 🔥 Render 6 skeleton items while loading */
					  Array.from({ length: 6 }).map((_, i) => <MessageSkeleton key={i} />)
					: userDetails?.currentUser?.following.map((user) => {
							const unreadNotif = notifications.find(
								(n) =>
									(n.sender._id === user._id || n.sender === user._id) &&
									n.type === "message" &&
									!n.isRead
							);
							const hasUnread = !!unreadNotif;

							return (
								<div
									key={user._id}
									className={`flex items-center gap-4 p-3 rounded-xl transition-all border-2 ${
										hasUnread
											? "bg-blue-50 border-blue-200 shadow-sm"
											: "bg-gray-50 border-transparent"
									} hover:shadow-md hover:border-gray-200`}
								>
									<div className="relative">
										<Image
											src={user.profilePic || "/blank-pp.jpg"}
											className="rounded-full border border-gray-200 object-cover"
											height={55}
											width={55}
											alt="pp"
										/>
										{hasUnread && (
											<span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 border-2 border-white rounded-full animate-bounce" />
										)}
									</div>

									<Link
										href={`/${userId}/messages/${user._id}`}
										onClick={() => handleOpenChat(user._id)}
										className="flex-1"
									>
										<div className="flex flex-col">
											<div className="flex justify-between items-center">
												<span
													className={`text-lg ${
														hasUnread
															? "font-bold text-blue-900"
															: "font-medium text-gray-800"
													}`}
												>
													{user.fullName}
												</span>
												{hasUnread && (
													<span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md font-black tracking-tighter uppercase">
														Unread
													</span>
												)}
											</div>

											<div className="flex items-center gap-2">
												<p
													className={`text-sm line-clamp-1 ${
														hasUnread
															? "text-blue-700 font-semibold"
															: "text-gray-500"
													}`}
												>
													{hasUnread
														? `New message: ${unreadNotif.message}`
														: "No new messages"}
												</p>
											</div>
										</div>
									</Link>
								</div>
							);
					  })}
				{!loading && userDetails?.currentUser?.following.length === 0 && (
					<div className="text-center py-10 text-gray-400">
						No friends found.
					</div>
				)}
			</div>
		</main>
	);
};

export default UserMessageDashboard;
