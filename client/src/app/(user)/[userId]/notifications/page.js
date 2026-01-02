"use client";

import { React, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NotificationsPage() {
	const { userId } = useParams();
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();
	// ✅ Fetch all notifications
	const fetchNotifications = async () => {
		if (!userId) return;

		setLoading(true);
		setError("");

		try {
			const res = await fetch(
				`http://localhost:8000/users/${userId}/notifications`
			);

			if (!res.ok) throw new Error("Failed to fetch notifications");

			const data = await res.json();
			setNotifications(data.notifications || []);
		} catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotifications();
	}, [userId]);

	// ✅ Mark notification as read
	const markAsRead = async (notificationId) => {
		try {
			const res = await fetch(
				`http://localhost:8000/users/${userId}/notifications/${notificationId}/read`,
				{ method: "PUT" }
			);

			if (!res.ok) throw new Error("Failed to mark as read");

			// Update UI instantly
			setNotifications((prev) =>
				prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
			);
		} catch (err) {
			console.error("Error updating notification:", err.message);
			alert("Failed to update notification.");
		}
	};

	// ✅ UI States
	if (loading)
		return (
			<div className="flex justify-center items-center h-screen text-gray-600">
				<p>Loading notifications...</p>
			</div>
		);

	if (error)
		return (
			<div className="flex flex-col justify-center items-center h-screen text-center">
				<p className="text-red-500 mb-4">⚠️ {error}</p>
				<button
					onClick={fetchNotifications}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Retry
				</button>
			</div>
		);

	if (notifications.length === 0)
		return (
			<div className="flex justify-center items-center h-screen text-gray-500">
				<p>No notifications found.</p>
			</div>
		);

	// ✅ Main render
	return (
		<div className="bg-white p-6 ">
			<div className="max-w-xl mx-auto  p-4 bg-white h-full rounded-sm">
				<div
					className="flex content-start items-start text-2xl font-bold w-full"
					title="go back"
				>
					<span
						onClick={() => router.back()}
						className="hover:bg-slate-100 h-8 w-8 cursor-pointer text-center rounded-2xl"
					>
						❮
					</span>
				</div>
				<h1 className="text-2xl font-semibold mb-6">Notifications</h1>

				<div className="space-y-4">
					{notifications.map((notification) => (
						<div
							key={notification._id}
							className={`p-4 rounded-sm shadow transition ${
								notification.isRead
									? "bg-gray-100 border border-gray-200"
									: "bg-green-200 border border-blue-100"
							}`}
						>
							{/* Notification message */}
							<p className="text-gray-800">
								<strong>{notification.sender?.fullName || "Someone"}</strong>{" "}
								{notification.type === "like" && "liked your post."}
								{notification.type === "comment" && "commented on your post."}
								{notification.type === "follow" && "started following you."}
								{!notification.type && notification.message && (
									<> {notification.message}</>
								)}
							</p>
							{/* Optional post info */}
							{notification.post && (
								<p className="text-sm text-gray-500 mt-1 italic">
									“{notification.post.content.slice(0, 60)}...”
								</p>
							)}
							{/* Footer (timestamp + actions) */}
							<div className="flex justify-between items-center mt-3 text-sm">
								<span className="text-gray-400">
									{new Date(notification.createdAt).toLocaleString()}
								</span>
								{notification.isRead ? (
									<span className="text-green-600 font-medium">Read</span>
								) : (
									<button
										onClick={() => markAsRead(notification._id)}
										className="text-blue-600 hover:underline"
									>
										Mark as Read
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
