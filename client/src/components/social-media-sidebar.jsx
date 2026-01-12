"use client";

import React, { useEffect, useState, useRef } from "react";
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
	const [unreadNotifications, setUnreadNotifications] = useState(0);
	const [unreadMessages, setUnreadMessages] = useState(0);
	const socketRef = useRef(null);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	// ---------- Setup Socket ----------
	useEffect(() => {
		if (!userId) return;

		const io = require("socket.io-client");
		socketRef.current = io(NEXT_PUBLIC_API_URL, { transports: ["websocket"] });

		// Join user room
		socketRef.current.emit("join", userId);

		// Listen for notifications
		socketRef.current.on("updateUnreadCount", (data) =>
			setUnreadNotifications(data.count)
		);
		socketRef.current.on("newNotification", () =>
			setUnreadNotifications((prev) => prev + 1)
		);

		// Listen for new messages
		socketRef.current.on("newMessage", () =>
			setUnreadMessages((prev) => prev + 1)
		);

		return () => socketRef.current.disconnect();
	}, [userId, NEXT_PUBLIC_API_URL]);

	// ---------- Fetch User ----------
	useEffect(() => {
		if (!userId) return;

		const fetchUser = async () => {
			try {
				const { data } = await axios.get(
					`${NEXT_PUBLIC_API_URL}/users/${userId}`
				);
				setUser(data);
			} catch (err) {
				console.error("Failed to fetch user:", err);
			}
		};

		fetchUser();
	}, [userId, NEXT_PUBLIC_API_URL]);

	// ---------- Fetch initial unread counts ----------
	useEffect(() => {
		if (!userId) return;

		const fetchCounts = async () => {
			try {
				const notifRes = await axios.get(
					`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications/unreadNotificationCount`
				);
				setUnreadNotifications(notifRes.data.count || 0);

				const msgRes = await axios.get(
					`${NEXT_PUBLIC_API_URL}/messages/${userId}/unreadCount`
				);
				setUnreadMessages(msgRes.data.count || 0);
			} catch (err) {
				console.error("Failed to fetch unread counts:", err);
			}
		};

		fetchCounts();
	}, [userId, NEXT_PUBLIC_API_URL]);

	return (
		<div className="h-screen sticky top-0">
			<div className="flex flex-col justify-between h-full w-[50px] sm:w-[100px] xl:w-[320px] bg-green-950 border-r border-green-900 px-2 py-4 text-gray-200">
				{/* ---------- TOP ---------- */}
				<div className="space-y-6">
					{/* Logo */}
					<Link
						href={`/${userId}/home`}
						className="flex items-center gap-3 px-3"
					>
						<FaConnectdevelop className="text-3xl text-green-400" />
						<h2 className="hidden xl:block text-xl font-bold text-white">
							Mero Sanjal
						</h2>
					</Link>

					{/* Navigation */}
					<div className="flex flex-col gap-1">
						{/* Home */}
						<Link href={`/${userId}/home`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<IoHomeSharp />
								</span>
								<span className="hidden xl:block ml-3 font-medium">Home</span>
							</Button>
						</Link>

						{/* Search */}
						<Link href={`/${userId}/search`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<RiSearchFill />
								</span>
								<input
									type="text"
									placeholder="Search"
									className="hidden xl:block ml-3 w-full bg-transparent focus:outline-none text-sm placeholder-gray-400"
								/>
							</Button>
						</Link>

						{/* Notifications */}
						<Link href={`/${userId}/notifications`}>
							<Button
								className="relative w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<FaBell />
								</span>
								{unreadNotifications > 0 && (
									<span className="absolute left-6 top-1 bg-red-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
										{unreadNotifications > 9 ? "9+" : unreadNotifications}
									</span>
								)}
								<span className="hidden xl:block ml-3 font-medium">
									Notifications
								</span>
							</Button>
						</Link>

						{/* Messages */}
						<Link href={`/${userId}/messages`}>
							<Button
								className="relative w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<IoMail />
								</span>
								{unreadMessages > 0 && (
									<span className="absolute left-6 top-1 bg-red-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
										{unreadMessages > 9 ? "9+" : unreadMessages}
									</span>
								)}
								<span className="hidden xl:block ml-3 font-medium">
									Messages
								</span>
							</Button>
						</Link>

						{/* Profile */}
						<Link href={`/${userId}/profile`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<FaUserAlt />
								</span>
								<span className="hidden xl:block ml-3 font-medium">
									Profile
								</span>
							</Button>
						</Link>
					</div>
				</div>

				{/* ---------- BOTTOM ---------- */}
				<div className="space-y-3">
					{/* User Info */}
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

					{/* Logout */}
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
