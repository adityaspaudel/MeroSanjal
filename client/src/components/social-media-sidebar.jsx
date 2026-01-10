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
	const [unreadCount, setUnreadCount] = useState(0);
	const socketRef = useRef(null);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

	// ---------- Setup Socket ----------
	useEffect(() => {
		if (!userId) return;

		socketRef.current = require("socket.io-client")(NEXT_PUBLIC_API_URL, {
			transports: ["websocket"],
		});

		socketRef.current.emit("join", userId);

		socketRef.current.on("updateUnreadCount", (data) => {
			setUnreadCount(data.count);
		});

		socketRef.current.on("newNotification", (data) => {
			setUnreadCount((prev) => prev + 1);
		});

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
				console.error(err);
			}
		};
		fetchUser();
	}, [userId, NEXT_PUBLIC_API_URL]);

	// ---------- Fetch Initial Unread Count ----------
	useEffect(() => {
		if (!userId) return;
		const fetchUnread = async () => {
			try {
				// /users/:userId/notifications/unreadNotificationCount

				const res = await axios.get(
					`${NEXT_PUBLIC_API_URL}/users/${userId}/notifications/unreadNotificationCount`
				);
				setUnreadCount(res.data.count);
			} catch (err) {
				console.error(err);
			}
		};
		fetchUnread();
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

						{/* Messages */}
						<Link href={`/${userId}/messages`}>
							<Button
								className="w-full justify-start rounded-lg text-gray-200 hover:bg-green-900 hover:text-white transition"
								variant="ghost"
							>
								<span className="text-xl">
									<IoMail />
								</span>
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
