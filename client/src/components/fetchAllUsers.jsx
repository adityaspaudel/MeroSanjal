"use client";

import { React, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AllUsers() {
	const params = useParams();
	const currentUserId = params.userId;

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [updating, setUpdating] = useState({});

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch("http://localhost:8000/getAllUsers");
				if (!response.ok) throw new Error("Failed to fetch users");

				const data = await response.json();
				const usersWithFollowStatus = (
					Array.isArray(data.users) ? data.users : []
				).map((user) => ({
					...user,
					isFollowing: user.followers?.includes(currentUserId) || false,
				}));
				setUsers(usersWithFollowStatus);
			} catch (err) {
				console.error("Error fetching users:", err);
				setError("Failed to load users");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [currentUserId]);

	const toggleFollow = async (userId) => {
		setUpdating((prev) => ({ ...prev, [userId]: true }));
		try {
			const response = await fetch(
				`http://localhost:8000/${currentUserId}/toggleFollowUnfollow`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ followingTo: userId }),
				}
			);
			if (!response.ok) throw new Error("Failed to toggle follow");

			setUsers((prev) =>
				prev.map((user) =>
					user._id === userId
						? { ...user, isFollowing: !user.isFollowing }
						: user
				)
			);
		} catch (err) {
			console.error(err);
			alert("Failed to toggle follow");
		} finally {
			setUpdating((prev) => ({ ...prev, [userId]: false }));
		}
	};

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen bg-green-50">
				<p className="text-gray-600 text-lg">Loading users...</p>
			</div>
		);

	if (error)
		return (
			<div className="flex justify-center items-center h-screen bg-green-50">
				<p className="text-red-600 text-lg">{error}</p>
			</div>
		);

	return (
		<div className="p-4 min-h-screen bg-white shadow hover:shadow-black hover:shadow-md  transition 1s">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>
			{users.length === 0 ? (
				<p className="text-gray-600">No users found.</p>
			) : (
				<div className="flex flex-col gap-4">
					{users.map((user) => (
						<div
							key={user._id}
							className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-sm shadow hover:shadow-lg transition-shadow duration-200"
						>
							<div className="flex flex-col text-center sm:text-left sm:flex-1">
								<p className="font-semibold text-gray-800">{user.fullName}</p>
								<p className="text-sm text-gray-500">{user.email}</p>
							</div>
							{user._id !== currentUserId && (
								<button
									onClick={() => toggleFollow(user._id)}
									disabled={updating[user._id]}
									className={`mt-2 sm:mt-0 px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
										user.isFollowing
											? "bg-red-500 hover:bg-red-600"
											: "bg-green-500 hover:bg-green-600"
									}`}
								>
									{updating[user._id]
										? "..."
										: user.isFollowing
										? "Unfollow"
										: "Follow"}
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
