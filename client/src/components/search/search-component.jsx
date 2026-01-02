"use client";

import { React, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const SearchComponent = () => {
	const [fullName, setFullName] = useState("");
	const [results, setResults] = useState([]);
	const [followState, setFollowState] = useState({});
	const { userId } = useParams();
	const router = useRouter();
	console.log("current user from useParams", userId);

	const handleSearch = async () => {
		if (!fullName.trim()) return;
		try {
			const { data } = await axios.get("http://localhost:8000/search", {
				params: { query: fullName, currentuserId: userId }, // ✅ send current user
			});

			setResults(data.users);

			// ✅ Use real DB follow state
			const initialFollowState = {};
			data.users.forEach((user) => {
				initialFollowState[user._id] = user.isFollowing;
			});
			setFollowState(initialFollowState);
		} catch (error) {
			console.log("Error searching user:", error);
			setResults([]);
		}
	};

	const toggleFollowUnfollow = async (uid) => {
		try {
			await fetch(`http://localhost:8000/${userId}/toggleFollowUnfollow`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ followingTo: uid }),
			});

			// Toggle local state
			setFollowState((prev) => ({
				...prev,
				[uid]: !prev[uid],
			}));
		} catch (error) {
			console.error("Error toggling follow/unfollow:", error);
		}
	};

	return (
		<div className="p-4 bg-white min-h-full min-w-full">
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
			<input
				type="text"
				name="fullName"
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
				placeholder="Search..."
				className="border p-2 rounded"
			/>
			<button
				onClick={handleSearch}
				className="ml-2 p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
			>
				Search
			</button>

			<ul className="mt-4">
				{results.length > 0 ? (
					results.map((user) => (
						<div key={user._id} className="flex items-center gap-4 my-2">
							<li>{user.fullName}</li>
							<button
								onClick={() => toggleFollowUnfollow(user._id)}
								className={`px-3 py-1 rounded text-white ${
									followState[user._id] ? "bg-red-600" : "bg-green-600"
								}`}
							>
								{followState[user._id] ? "unfollow" : "Follow"}
							</button>
						</div>
					))
				) : (
					<li>No users found</li>
				)}
			</ul>
		</div>
	);
};

export default SearchComponent;
