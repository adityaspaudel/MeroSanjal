"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const UserMessageDashboard = () => {
	const { userId } = useParams();
	const [userDetails, setUserDetails] = useState(null);
	const router = useRouter();

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
		}
	}, [userId]);
	useEffect(() => {
		getUserDetails();
	}, [getUserDetails]);
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
