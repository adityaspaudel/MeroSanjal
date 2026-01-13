"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaConnectdevelop, FaUserAlt, FaBell } from "react-icons/fa";
import { IoHomeSharp, IoLogOut, IoMail } from "react-icons/io5";
import { RiSearchFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";

const SocialMediaSidebarComponent = () => {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [unreadMsgCount, setUnreadMsgCount] = useState(0);
	const socketRef = useRef(null);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	// ---------- 1. Optimized Fetch Counts ----------
	const fetchCounts = useCallback(async () => {
		if (!userId) return;
		try {
			const res = await axios.get(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications`
			);
			const notifications = res.data.notifications;

			const generalUnread = notifications.filter(
				(n) => !n.isRead && n.type !== "message"
			).length;
			const messageUnread = notifications.filter(
				(n) => !n.isRead && n.type === "message"
			).length;

			setUnreadCount(generalUnread);
			setUnreadMsgCount(messageUnread);
		} catch (err) {
			console.error("Error fetching notification counts:", err);
		}
	}, [userId, NEXT_PUBLIC_API_URL]);

	// ---------- 2. Setup Socket ----------
	useEffect(() => {
		if (!userId) return;

		socketRef.current = require("socket.io-client")(NEXT_PUBLIC_API_URL, {
			transports: ["websocket"],
		});

		socketRef.current.emit("join", userId);

		socketRef.current.on("updateUnreadCount", (data) => {
			setUnreadCount(data.count);
		});

		// Listen for new notifications
		socketRef.current.on("newNotification", (data) => {
			if (data.notification.type === "message") {
				setUnreadMsgCount((prev) => prev + 1);
			} else {
				setUnreadCount((prev) => prev + 1);
			}
		});

		// 🔥 NEW: Listen for "messagesRead" event to clear the blue badge in real-time
		socketRef.current.on("messagesRead", () => {
			fetchCounts();
		});

		return () => socketRef.current.disconnect();
	}, [userId, NEXT_PUBLIC_API_URL, fetchCounts]);

	// ---------- 3. Fetch Initial Data ----------
	useEffect(() => {
		if (!userId) return;
		const fetchUser = async () => {
			try {
				const { data } = await axios.get(
					`${NEXT_PUBLIC_API_URL}/users/${userId}`
				);
				setUser(data);
			} catch (err) {
				console.error(err);
			}
		};
		fetchUser();
		fetchCounts();
	}, [userId, NEXT_PUBLIC_API_URL, fetchCounts]);

	return (
		<div className="h-screen sticky top-0">
			<div className="flex flex-col justify-between h-full w-[50px] sm:w-[100px] xl:w-[320px] bg-green-950 border-r border-green-900 px-2 py-4 text-gray-200 ">
				<div className="space-y-6">
					<Link
						href={`/${userId}/home`}
						className="flex items-center gap-3 px-3"
					>
						<FaConnectdevelop className="text-3xl text-green-400" />
						<h2 className="hidden xl:block text-xl font-bold text-white">
							Mero Sanjal
						</h2>
					</Link>

					<div className="flex flex-col gap-1">
						<Link href={`/${userId}/home`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<IoHomeSharp className="text-xl" />
								<span className="hidden xl:block ml-3 font-medium">Home</span>
							</Button>
						</Link>

						<Link href={`/${userId}/search`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<RiSearchFill className="text-xl" />
								<span className="hidden xl:block ml-3 font-medium">Search</span>
							</Button>
						</Link>

						<Link href={`/${userId}/notifications`}>
							<Button
								className="relative w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<FaBell className="text-xl" />
								{unreadCount > 0 && (
									<span className="absolute left-6 top-1 bg-red-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
										{unreadCount > 9 ? "9+" : unreadCount}
									</span>
								)}
								<span className="hidden xl:block ml-3 font-medium">
									Notifications
								</span>
							</Button>
						</Link>

						<Link href={`/${userId}/messages`}>
							<Button
								className="relative w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<IoMail className="text-xl" />
								{unreadMsgCount > 0 && (
									<span className="absolute left-6 top-1 bg-blue-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
										{unreadMsgCount > 9 ? "9+" : unreadMsgCount}
									</span>
								)}
								<span className="hidden xl:block ml-3 font-medium">
									Messages
								</span>
							</Button>
						</Link>

						<Link href={`/${userId}/profile`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<FaUserAlt className="text-xl" />
								<span className="hidden xl:block ml-3 font-medium">
									Profile
								</span>
							</Button>
						</Link>
					</div>
				</div>

				<div className="space-y-3">
					{user && (
						<Link
							href={`/${userId}/profile`}
							className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-900 transition"
						>
							<Avatar>
								<AvatarImage
									src={user.profilePic || "/blank-pp.jpg"}
									alt={user.fullName}
								/>
							</Avatar>
							<div className="hidden xl:block">
								<p className="text-sm font-semibold text-white">
									{user.fullName}
								</p>
								<p className="text-xs text-gray-400">
									@{user.email.split("@")[0]}
								</p>
							</div>
						</Link>
					)}

					<Link href="/">
						<Button
							className="w-full justify-start text-red-400 hover:bg-red-900/40 hover:text-white rounded-lg"
							variant="ghost"
						>
							<IoLogOut className="text-xl" />
							<span className="hidden xl:block ml-3 font-medium">Logout</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SocialMediaSidebarComponent;
