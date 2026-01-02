"use client";

import React, { useEffect, useState } from "react";
import { FaConnectdevelop, FaUserAlt, FaBell } from "react-icons/fa";
import {
	IoHomeSharp,
	IoLogOut,
	// IoSettingsSharp,
	IoMail,
} from "react-icons/io5";
import { RiSearchFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export function SocialMediaSidebarComponent() {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (socket) console.log("🟢 Socket connected:", socket.id);
	}, [socket]);

	useEffect(() => {
		const newSocket = io("http://localhost:8000", {
			transports: ["websocket"],
		});
		setSocket(newSocket);

		if (userId) newSocket.emit("join", userId);

		newSocket.on("updateUnreadCount", (data) => setUnreadCount(data.count));
		newSocket.on("newNotification", (data) =>
			console.log("🔔 New notification:", data)
		);

		return () => newSocket.disconnect();
	}, [userId]);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const { data } = await axios.get(
					`http://localhost:8000/users/${userId}`
				);
				setUser(data);
			} catch (err) {
				console.error("Error fetching user:", err);
			}
		};
		if (userId) fetchUser();
	}, [userId]);

	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const { data } = await axios.get(
					`http://localhost:8000/users/${userId}/notifications/unreadNotificationCount`
				);
				setUnreadCount(data.count);
			} catch (err) {
				console.error("Error fetching unread count:", err);
			}
		};
		if (userId) fetchUnreadCount();
	}, [userId]);

	return (
		<div className="h-screen sticky top-0 shadow hover:shadow-black hover:shadow-md transition 1s">
			<div className="flex flex-col justify-between h-full w-[80px] sm:w-[100px] md:w-[100px] xl:w-[300px]   bg-white shadow-lg px-2 py-4">
				{/* -------- TOP SECTION -------- */}
				<div className="space-y-6">
					{/* Logo */}
					<Link
						href={`/${userId}/home`}
						className="flex items-center gap-2 px-3"
					>
						<FaConnectdevelop className="text-3xl text-green-600" />
						<h2 className="hidden md:block text-xl font-bold text-gray-800 hover:text-green-600">
							Mero Sanjal
						</h2>
					</Link>

					{/* Nav Links */}
					<div className="flex flex-col gap-2">
						{/* Home */}
						<Link href={`/${userId}/home`}>
							<Button
								variant="ghost"
								className="w-full justify-start  hover:bg-gray-900 rounded-sm hover:text-white"
							>
								<IoHomeSharp className="text-xl" />
								<span className="hidden md:block ml-2 font-medium">Home</span>
							</Button>
						</Link>

						{/* Search */}
						<Link href={`/${userId}/search`}>
							<Button
								variant="ghost"
								className="w-full justify-start hover:bg-gray-900 hover:text-white rounded-sm"
							>
								<RiSearchFill className="text-xl" />
								<input
									type="text"
									placeholder="Search"
									className="hidden md:block ml-2 bg-transparent focus:outline-none w-full"
								/>
							</Button>
						</Link>

						{/* Notifications */}
						<Link href={`/${userId}/notifications`}>
							<Button
								variant="ghost"
								className="relative w-full justify-start hover:bg-gray-900 hover:text-white rounded-sm"
							>
								<FaBell className="text-xl" />
								{unreadCount > 0 && (
									<span className="absolute top-0 left-6 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
										{unreadCount > 10 ? "10+" : unreadCount}
									</span>
								)}
								<span className="hidden md:block ml-2 font-medium">
									Notifications
								</span>
							</Button>
						</Link>

						{/* Messages */}
						<Link href={`/${userId}/messages`}>
							<Button
								variant="ghost"
								className="w-full justify-start hover:bg-gray-900 hover:text-white rounded-sm"
							>
								<IoMail className="text-xl" />
								<span className="hidden md:block ml-2 font-medium">
									Messages
								</span>
							</Button>
						</Link>

						{/* Profile */}
						<Link href={`/${userId}/profile`}>
							<Button
								variant="ghost"
								className="w-full justify-start hover:bg-gray-900 hover:text-white rounded-sm"
							>
								<FaUserAlt className="text-xl" />
								<span className="hidden md:block ml-2 font-medium">
									Profile
								</span>
							</Button>
						</Link>
					</div>
				</div>

				{/* -------- BOTTOM SECTION -------- */}
				<div className="space-y-3 ">
					{/* User Info */}
					{user && (
						<Link
							href={`/${userId}/profile`}
							className="flex items-center gap-2 p-2 rounded-sm hover:bg-gray-900 hover:text-white transition "
						>
							<Avatar>
								<AvatarImage
									src={user.profilePic || "/blank-pp.jpg"}
									alt={user.fullName}
								/>
							</Avatar>
							<div className="hidden md:flex flex-col hover:text-white">
								<p className="text-sm font-semibold ">{user.fullName}</p>
								<p className="text-xs  ">@{user.email.split("@")[0]}</p>
							</div>
						</Link>
					)}

					{/* Settings */}
					{/* <Link href={`/${userId}/userSettings`}>
						<Button
							variant="ghost"
							className="w-full justify-start hover:bg-gray-900 hover:text-white rounded-sm"
						>
							<IoSettingsSharp className="text-xl" />
							<span className="hidden md:block ml-2 font-medium">Settings</span>
						</Button>
					</Link> */}

					{/* Logout */}
					<Link href="/">
						<Button className="w-full justify-start text-red-600 hover:bg-red-900 hover:text-white rounded-sm font-bold">
							<IoLogOut className="text-xl" />
							<span className="hidden md:block ml-2">Logout</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
