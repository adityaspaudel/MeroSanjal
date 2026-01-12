"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const UserMessageDashboard = () => {
	const { userId } = useParams();
	const [userDetails, setUserDetails] = useState(null);
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	// alert(userId);
	const getUserDetails = useCallback(async () => {
		try {
			const response = await fetch(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/getFollowingFriendsList`
			);
			const data = await response.json();
			if (!response.ok) throw new Error("error while fetching friends");
			console.log("response ", response);
			setUserDetails(data);
		} catch (error) {
			console.error("could not fetch friends", error);
		} finally {
			console.log("");
			setLoading(false);
		}
	}, [userId]);
	useEffect(() => {
		getUserDetails();
	}, [getUserDetails]);

	if (loading) {
		return (
			<main className="min-h-full bg-white overflow-auto text-black p-6 max-w-xl mx-auto h-full rounded-sm animate-pulse">
				{/* Back Button */}
				<div className="flex items-start text-2xl font-bold w-full">
					<div className="h-8 w-8 bg-gray-300 rounded-2xl"></div>
				</div>

				{/* Title */}
				<div className="h-7 w-64 bg-gray-300 rounded mt-4 mb-6"></div>

				{/* User List */}
				<div className="flex flex-col gap-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className="flex items-center gap-4 bg-gray-100 p-2 rounded-md"
						>
							{/* Avatar */}
							<div className="h-12 w-12 bg-gray-300 rounded-full"></div>

							{/* User Info */}
							<div className="flex flex-col gap-2 flex-1">
								<div className="h-4 w-40 bg-gray-300 rounded"></div>
								<div className="h-3 w-52 bg-gray-300 rounded"></div>
							</div>
						</div>
					))}
				</div>
			</main>
		);
	}
	return (
		<main className="min-h-full bg-white overflow-auto text-black p-6 max-w-xl mx-auto   h-full rounded-sm">
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
			<div className="text-2xl font-bold">User Message Dashboard</div>
			{userDetails && (
				<div className=" flex flex-col gap-2 ">
					{userDetails.currentUser.following.map((user) => (
						<div
							key={user._id}
							className="flex justify-start items-center bg-gray-100 gap-4 hover:bg-gray-900 hover:text-white p-2 rounded-md"
						>
							<div>
								<Image
									src="/blank-pp.jpg"
									className="rounded-full"
									height={50}
									width={50}
									alt="pp"
								/>
							</div>
							<Link href={`/${userId}/messages/${user._id}`}>
								<div className="flex flex-col">
									<div>{user.fullName}</div>
									<div>{user.email}</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			)}
		</main>
	);
};

export default UserMessageDashboard;
