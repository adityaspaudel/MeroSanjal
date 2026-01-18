"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const SearchComponent = () => {
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	const [fullName, setFullName] = useState("");
	const [results, setResults] = useState([]);
	const [followState, setFollowState] = useState({});
	const [loading, setLoading] = useState(false);
	const { userId } = useParams(); // This is the logged-in user's ID from the URL

	const [apiMessage, setApiMessage] = useState(null);
	const router = useRouter();

	const executeSearch = async (searchTerm) => {
		if (!searchTerm.trim()) {
			setResults([]);
			return;
		}
		setLoading(true);
		try {
			const { data } = await axios.get(`${NEXT_PUBLIC_API_URL}/search`, {
				params: { query: searchTerm, currentuserId: userId },
			});

			setResults(data.users);

			const initialFollowState = {};
			data.users.forEach((user) => {
				initialFollowState[user._id] = user.isFollowing;
			});
			setFollowState(initialFollowState);
		} catch (error) {
			// console.error("Error searching user:", error);
			setApiMessage(error);
			setResults([]);
		} finally {
			setLoading(false);
		}
	};

	// Live search debounce logic
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			executeSearch(fullName);
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [fullName]);

	const toggleFollowUnfollow = async (uid) => {
		try {
			// Optimistic UI update
			setFollowState((prev) => ({ ...prev, [uid]: !prev[uid] }));

			await fetch(`${NEXT_PUBLIC_API_URL}/${userId}/toggleFollowUnfollow`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ followingTo: uid }),
			});
		} catch (error) {
			console.error("Error toggling follow/unfollow:", error);
			// Revert if error
			setFollowState((prev) => ({ ...prev, [uid]: !prev[uid] }));
		}
	};

	return (
		<div className="p-6 bg-slate-50 min-h-screen w-full">
			{/* Header Section */}
			<div className="flex items-center gap-4 mb-8">
				<button
					onClick={() => router.back()}
					className="p-2 hover:bg-white rounded-full transition-all shadow-sm active:scale-95"
				>
					<span className="text-xl font-bold">❮</span>
				</button>
				<h1 className="text-2xl font-bold text-slate-800">Find People</h1>
			</div>
			{/* Search Bar Section */}
			<div className="flex gap-2 w-2xl mb-10">
				<div className="relative flex-1">
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder="Search by name..."
						className="w-full border-none p-3 pl-10 rounded-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-black"
					/>
					<span className="absolute left-3 top-3.5 opacity-40">🔍</span>
				</div>
				<button
					onClick={() => executeSearch(fullName)}
					className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-sm transition-colors shadow-md"
				>
					Search
				</button>
			</div>
			{apiMessage && <pre>{JSON.stringify(apiMessage, 2, 2)}</pre>}

			{/* Results Section */}
			<div className="w-xl">
				{loading ? (
					<div className="flex items-center gap-2 text-slate-500">
						<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<p>Searching...</p>
					</div>
				) : results.length > 0 ? (
					<div className="flex flex-col gap-3">
						{results.map((user) => (
							<div
								key={user._id}
								className="flex items-center justify-between p-4 hover:bg-gray-100 bg-white rounded-sm shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center gap-3">
									{/* User Avatar */}
									<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold uppercase shadow-inner">
										{user.fullName.charAt(0)}
									</div>
									<div>
										<h3 className="font-semibold text-slate-800">
											{user.fullName}
										</h3>
										<p className="text-xs text-slate-400  tracking-wider font-medium">
											{user._id === userId ? "Your Profile" : "User"}
										</p>
									</div>
								</div>

								{/* Conditional Rendering: Hide button if searching for self */}
								{user._id !== userId ? (
									<button
										onClick={() => toggleFollowUnfollow(user._id)}
										className={`px-5 py-2 rounded-sm text-sm font-semibold transition-all shadow-sm ${
											followState[user._id]
												? "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200"
												: "bg-blue-600 text-white hover:bg-blue-700"
										}`}
									>
										{followState[user._id] ? "Following" : "Follow"}
									</button>
								) : (
									<span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold uppercase tracking-tight">
										You
									</span>
								)}
							</div>
						))}
					</div>
				) : (
					fullName && (
						<div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
							<p className="text-slate-400">
								No users found matching &quot;{fullName}&quot;
							</p>
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default SearchComponent;
