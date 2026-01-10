"use client";

import { React, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AllUsers() {
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	const params = useParams();
	const currentUserId = params.userId;

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [updating, setUpdating] = useState({});

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch(`${NEXT_PUBLIC_API_URL}/getAllUsers`);
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
				`${NEXT_PUBLIC_API_URL}/${currentUserId}/toggleFollowUnfollow`,
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
			<div className="space-y-4 animate-pulse border p-4">
				{Array.from({ length: 10 }).map((_, index) => (
					<div
						key={index}
						className="flex flex-col gap-2 sm:flex-row items-center justify-between p-4 bg-gray-100 rounded-sm shadow"
					>
						{/* Name + Email */}
						<div className="flex flex-col text-center sm:text-left sm:flex-1 gap-2">
							<div className="h-4 bg-gray-300 rounded w-40 mx-auto sm:mx-0"></div>
							<div className="h-3 bg-gray-300 rounded w-40 mx-auto sm:mx-0"></div>
						</div>

						{/* Follow button skeleton */}
						<div className="mt-2 sm:mt-0">
							<div className="h-9 w-24 bg-gray-300 rounded-md"></div>
						</div>
					</div>
				))}
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
				<div className="flex flex-col gap-2">
					{users.map((user) => (
						<div
							key={user._id}
							className="flex flex-col gap-2 sm:flex-row items-center justify-between p-4 bg-white hover:bg-gray-900 hover:text-white rounded-sm shadow hover:shadow-lg transition-shadow duration-200"
						>
							<div className="flex flex-col text-center sm:text-left sm:flex-1">
								<p className="font-semibold ">{user.fullName}</p>
								<p className="text-sm ">{user.email}</p>
							</div>
							<div>
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
						</div>
					))}
				</div>
			)}
		</div>
	);
}
