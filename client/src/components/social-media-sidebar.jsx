"use client";

import React, { useEffect, useState } from "react";
import { FaConnectdevelop, FaUserAlt, FaBell } from "react-icons/fa";
import { IoHomeSharp, IoLogOut, IoMail } from "react-icons/io5";
import { RiSearchFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import PropTypes from "prop-types";

export function SocialMediaSidebarComponent() {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [socket, setSocket] = useState(null);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	useEffect(() => {
		console.log(socket);
		const newSocket = io(`${NEXT_PUBLIC_API_URL}`, {
			transports: ["websocket"],
		});
		setSocket(newSocket);

		if (userId) newSocket.emit("join", userId);

		newSocket.on("updateUnreadCount", (data) => setUnreadCount(data.count));

		return () => newSocket.disconnect();
	}, [userId]);

	useEffect(() => {
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
		if (userId) fetchUser();
	}, [userId]);

	return (
		<div className="h-screen sticky top-0">
			<div
				className="flex flex-col justify-between h-full w-[50px] sm:w-[100px] xl:w-[320px]
				bg-green-950 border-r border-green-900 px-2 py-4 text-gray-200"
			>
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
						<SidebarLink
							href={`/${userId}/home`}
							icon={<IoHomeSharp />}
							label="Home"
						/>
						<SidebarSearchLink
							href={`/${userId}/search`}
							icon={<RiSearchFill />}
						/>
						<SidebarNotificationLink
							href={`/${userId}/notifications`}
							icon={<FaBell />}
							count={unreadCount}
						/>
						<SidebarLink
							href={`/${userId}/messages`}
							icon={<IoMail />}
							label="Messages"
						/>
						<SidebarLink
							href={`/${userId}/profile`}
							icon={<FaUserAlt />}
							label="Profile"
						/>
					</div>
				</div>

				{/* ---------- BOTTOM ---------- */}
				<div className="space-y-3">
					{/* User Info */}
					{user && (
						<Link
							href={`/${userId}/profile`}
							className="flex items-center gap-3 p-3 rounded-lg
								hover:bg-green-900 transition"
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
							variant="ghost"
							className="w-full justify-start text-red-400 hover:bg-red-900/40 hover:text-white rounded-lg"
						>
							<IoLogOut className="text-xl" />
							<span className="hidden xl:block ml-3 font-medium">Logout</span>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

/* ---------- Reusable UI Components ---------- */

function SidebarLink({ href, icon, label }) {
	return (
		<Link href={href}>
			<Button
				variant="ghost"
				className="w-full justify-start rounded-lg
					text-gray-200 hover:bg-green-900 hover:text-white transition"
			>
				<span className="text-xl">{icon}</span>
				<span className="hidden xl:block ml-3 font-medium">{label}</span>
			</Button>
		</Link>
	);
}

SidebarLink.propTypes = {
	href: PropTypes.string.isRequired,
	icon: PropTypes.node.isRequired,
	label: PropTypes.string.isRequired,
};

function SidebarSearchLink({ href, icon }) {
	return (
		<Link href={href}>
			<Button
				variant="ghost"
				className="w-full justify-start rounded-lg
					text-gray-200 hover:bg-green-900 hover:text-white transition"
			>
				<span className="text-xl">{icon}</span>
				<input
					type="text"
					placeholder="Search"
					className="hidden xl:block ml-3 w-full bg-transparent focus:outline-none text-sm placeholder-gray-400"
				/>
			</Button>
		</Link>
	);
}

SidebarSearchLink.propTypes = {
	href: PropTypes.string.isRequired,
	icon: PropTypes.node.isRequired,
};

function SidebarNotificationLink({ href, icon, count }) {
	return (
		<Link href={href}>
			<Button
				variant="ghost"
				className="relative w-full justify-start rounded-lg
					text-gray-200 hover:bg-green-900 hover:text-white transition"
			>
				<span className="text-xl">{icon}</span>

				{count > 0 && (
					<span
						className="absolute left-6 top-1 bg-red-500 text-white text-[10px]
						h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center"
					>
						{count > 9 ? "9+" : count}
					</span>
				)}

				<span className="hidden xl:block ml-3 font-medium">Notifications</span>
			</Button>
		</Link>
	);
}

SidebarNotificationLink.propTypes = {
	href: PropTypes.string.isRequired,
	icon: PropTypes.node.isRequired,
	count: PropTypes.number.isRequired,
};
