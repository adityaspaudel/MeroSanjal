"use client";

import { React, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function UserProfile() {
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [posts, setPosts] = useState([]);
	const [commentText, setCommentText] = useState({});
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [profileForm, setProfileForm] = useState({
		fullName: "",
		username: "",
		bio: "",
		profilePic: "",
		address: "",
		phoneNumber: "",
		hobbies: [],
		education: [],
		work: [],
	});
	// 🔽 ADDED — post edit
	const [editingPostId, setEditingPostId] = useState(null);
	const [editPostContent, setEditPostContent] = useState("");

	// 🔽 FIX — comment edit (per comment)
	const [editingCommentId, setEditingCommentId] = useState(null);

	const [newHobby, setNewHobby] = useState("");
	const [following, setFollowing] = useState("");
	const [followers, setFollowers] = useState("");

	const [showFollowing, setShowFollowing] = useState(false);
	const [showFollowers, setShowFollowers] = useState(false);
	// const [editingComment, setEditingComment] = useState(false);
	const [editCommentText, setEditCommentText] = useState("");
	const router = useRouter();
	// Fetch profile (user info + posts)
	useEffect(() => {
		if (!userId) return;

		const fetchProfile = async () => {
			setLoading(true);
			try {
				const { data } = await axios.get(
					`${NEXT_PUBLIC_API_URL}/users/${userId}/profile`,
				);
				console.log(data);
				setUser(data.user);
				setPosts(data.posts);
				setFollowing(data.user.following);
				setFollowers(data.user.followers);

				// Initialize form fields
				setProfileForm({
					fullName: data.user.fullName || "",
					username: data.user.username || "",
					bio: data.user.bio || "",
					profilePic: data.user.profilePic || "",
					address: data.user.address || "",
					phoneNumber: data.user.phoneNumber || "",
					hobbies: data.user.hobbies || [],
					education: data.user.education || [],
					work: data.user.work || [],
				});
			} catch (err) {
				console.error("Error fetching profile:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [userId]);

	// Toggle like
	const toggleLike = async (postId) => {
		try {
			const { data } = await axios.put(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/like`,
				{ userId },
			);

			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
								...p,
								likes: data.liked
									? [...p.likes, userId]
									: p.likes.filter((id) => id !== userId),
							}
						: p,
				),
			);
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};
	// 🔽 ADDED — Update Post
	const updatePost = async (postId) => {
		if (!editPostContent.trim()) return;
		try {
			await axios.put(`${NEXT_PUBLIC_API_URL}/posts/${postId}`, {
				content: editPostContent,
			});

			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId ? { ...p, content: editPostContent } : p,
				),
			);

			setEditingPostId(null);
			setEditPostContent("");
		} catch (err) {
			console.error("Update post error:", err);
		}
	};

	//  Delete Post
	const deletePost = async (postId) => {
		try {
			await axios.delete(`${NEXT_PUBLIC_API_URL}/posts/${postId}`);
			setPosts((prev) => prev.filter((p) => p._id !== postId));
		} catch (err) {
			console.error("Delete post error:", err);
		}
	};

	// Add comment
	const addComment = async (postId) => {
		const text = commentText[postId];
		if (!text?.trim()) return;

		try {
			const { data } = await axios.post(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
				{ userId, text },
			);

			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? { ...p, comments: [...p.comments, data.comment] }
						: p,
				),
			);

			setCommentText((prev) => ({ ...prev, [postId]: "" }));
		} catch (error) {
			console.error("Error adding comment:", error);
		}
	};

	// Handle profile form changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setProfileForm((prev) => ({ ...prev, [name]: value }));
	};

	// Hobbies
	const addHobby = () => {
		if (!newHobby.trim()) return;
		setProfileForm((prev) => ({
			...prev,
			hobbies: [...prev.hobbies, newHobby],
		}));
		setNewHobby("");
	};
	const removeHobby = (index) => {
		setProfileForm((prev) => ({
			...prev,
			hobbies: prev.hobbies.filter((_, i) => i !== index),
		}));
	};

	// Education
	const handleEducationChange = (index, field, value) => {
		const updated = [...profileForm.education];
		updated[index][field] = value;
		setProfileForm((prev) => ({ ...prev, education: updated }));
	};
	const addEducation = () => {
		setProfileForm((prev) => ({
			...prev,
			education: [...prev.education, { school: "", degree: "", year: "" }],
		}));
	};
	const removeEducation = (index) => {
		setProfileForm((prev) => ({
			...prev,
			education: prev.education.filter((_, i) => i !== index),
		}));
	};

	// Work
	const handleWorkChange = (index, field, value) => {
		const updated = [...profileForm.work];
		updated[index][field] = value;
		setProfileForm((prev) => ({ ...prev, work: updated }));
	};
	const addWork = () => {
		setProfileForm((prev) => ({
			...prev,
			work: [...prev.work, { company: "", position: "", from: "", to: "" }],
		}));
	};
	const removeWork = (index) => {
		setProfileForm((prev) => ({
			...prev,
			work: prev.work.filter((_, i) => i !== index),
		}));
	};

	const displayFollowing = () => {
		if (showFollowing === false) {
			setShowFollowing(true);
			setShowFollowers(false);
		}

		if (showFollowing === true) {
			setShowFollowing(false);
			setShowFollowers(false);
		}
	};

	const displayFollowers = () => {
		if (showFollowers == false) {
			setShowFollowing(false);
			setShowFollowers(true);
		}

		if (showFollowers == true) {
			setShowFollowing(false);
			setShowFollowers(false);
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Use the current state of profileForm for sending data
			const formData = {
				fullName: profileForm.fullName || "",
				username: profileForm.username || "",
				bio: profileForm.bio || "",
				profilePic: profileForm.profilePic || "",
				address: profileForm.address || "",
				phoneNumber: profileForm.phoneNumber || "",
				hobbies: Array.isArray(profileForm.hobbies) ? profileForm.hobbies : [],
				education: Array.isArray(profileForm.education)
					? profileForm.education
					: [],
				work: Array.isArray(profileForm.work) ? profileForm.work : [],
			};

			const { data } = await axios.put(
				`${NEXT_PUBLIC_API_URL}/users/${userId}/profile`,
				formData,
			);

			alert("Profile updated successfully!");
			setUser(data.user); // Update frontend user state
			setProfileForm(data.user); // Also update the form with latest data
			setEditing(false); // Close edit form
		} catch (err) {
			console.error("Error updating profile:", err);

			if (err.response?.data?.message) {
				alert(err.response.data.message);
			} else {
				alert("Failed to update profile");
			}
		}
	};

	// Update Comment
	const updateComment = async (postId, commentId) => {
		if (!editCommentText.trim()) return;
		try {
			const { data } = await axios.put(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${commentId}`,
				{ userId, text: editCommentText }, // only userId and text
			);
			console.log("data", data);
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
								...p,
								comments: p.comments.map((c) =>
									c._id === commentId ? { ...c, text: editCommentText } : c,
								),
							}
						: p,
				),
			);

			// setEditingComment(null);
			setEditCommentText("");
		} catch (error) {
			console.error(
				"Error updating comment:",
				error.response?.data || error.message,
			);
		} finally {
			setEditingCommentId(null);
		}
	};

	// Delete Comment
	const deleteComment = async (postId, commentId) => {
		try {
			await axios.delete(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${commentId}`,
				{ data: { userId } }, // only send userId
			);

			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
						: p,
				),
			);
		} catch (error) {
			console.error(
				"Error deleting comment:",
				error.response?.data || error.message,
			);
		}
	};

	if (loading)
		return (
			<div className="p-4 max-w-xl mx-auto animate-pulse">
				<div className="flex flex-col bg-white rounded-sm p-4 space-y-6">
					{/* Back Button */}
					<div className="h-8 w-8 bg-gray-300 rounded-full"></div>

					{/* User Info */}
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 bg-gray-300 rounded-full"></div>

						<div className="space-y-2 flex-1">
							<div className="h-5 w-40 bg-gray-300 rounded"></div>
							<div className="h-4 w-56 bg-gray-300 rounded"></div>
							<div className="h-4 w-48 bg-gray-300 rounded"></div>
							<div className="h-4 w-44 bg-gray-300 rounded"></div>
						</div>

						<div className="h-9 w-28 bg-gray-300 rounded"></div>
					</div>

					{/* Followers / Following */}
					<div className="flex gap-4">
						<div className="h-10 w-24 bg-gray-300 rounded"></div>
						<div className="h-10 w-24 bg-gray-300 rounded"></div>
					</div>

					{/* Posts */}
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="border rounded-md p-4 space-y-4 bg-white">
							{/* Post Author */}
							<div className="flex gap-3 items-center">
								<div className="w-10 h-10 bg-gray-300 rounded-full"></div>
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-300 rounded"></div>
									<div className="h-3 w-24 bg-gray-300 rounded"></div>
								</div>
							</div>

							{/* Post Content */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 rounded w-full"></div>
								<div className="h-4 bg-gray-300 rounded w-5/6"></div>
							</div>

							{/* Like Button */}
							<div className="flex gap-3 items-center">
								<div className="h-8 w-20 bg-gray-300 rounded"></div>
								<div className="h-4 w-16 bg-gray-300 rounded"></div>
							</div>

							{/* Comments */}
							<div className="border-t pt-3 space-y-2">
								<div className="h-3 w-24 bg-gray-300 rounded"></div>

								<div className="space-y-1">
									<div className="h-3 w-full bg-gray-300 rounded"></div>
									<div className="h-3 w-5/6 bg-gray-300 rounded"></div>
								</div>

								<div className="flex gap-2 mt-2">
									<div className="h-8 flex-1 bg-gray-300 rounded"></div>
									<div className="h-8 w-20 bg-gray-300 rounded"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	if (!user) return <p className="text-red-500">User not found</p>;

	return (
		<div className="">
			<div className="flex flex-col max-w-xl mx-auto  p-4 bg-white h-full rounded-sm">
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
				<br />
				{/* User Info */}
				<div className="mb-6 flex items-center gap-4">
					<div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center  font-bold text-2xl text-black">
						<img
							className="rounded-[50%] object-cover"
							src="/blank-pp.jpg"
							height="80px"
							width="80px"
						/>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-800">
							{user.fullName}
						</h2>
						<p className="text-sm text-gray-500">{user.email}</p>
						<p className="text-sm text-gray-600">{user.bio}</p>
						<p className="text-sm text-gray-600">{user.address}</p>
						<p className="text-sm text-gray-600">{user.phoneNumber}</p>
						{user.hobbies?.length > 0 && (
							<p className="text-sm text-gray-600">
								Hobbies: {user.hobbies.join(", ")}
							</p>
						)}
					</div>
					{/* Edit Button */}
					<button
						onClick={() => setEditing((prev) => !prev)}
						className="ml-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
					>
						{editing ? "Cancel" : "Edit Profile"}
					</button>
				</div>
				{/* Edit Profile Form */}
				{editing && (
					<form
						onSubmit={handleSubmit}
						className="mb-6 bg-white p-4 rounded shadow space-y-4"
					>
						<input
							type="text"
							name="fullName"
							value={profileForm.fullName}
							onChange={handleChange}
							placeholder="Full Name"
							className="w-full border px-3 py-2 rounded"
						/>
						<input
							type="text"
							name="username"
							value={profileForm.username}
							onChange={handleChange}
							placeholder="Username"
							className="w-full border px-3 py-2 rounded"
						/>
						<textarea
							name="bio"
							value={profileForm.bio}
							onChange={handleChange}
							placeholder="Bio"
							className="w-full border px-3 py-2 rounded"
						/>
						<input
							type="text"
							name="address"
							value={profileForm.address}
							onChange={handleChange}
							placeholder="Address"
							className="w-full border px-3 py-2 rounded"
						/>
						<input
							type="text"
							name="phoneNumber"
							value={profileForm.phoneNumber}
							onChange={handleChange}
							placeholder="Phone Number"
							className="w-full border px-3 py-2 rounded"
						/>
						{/* Hobbies */}
						<div>
							<h4 className="font-semibold mb-2">Hobbies</h4>
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									value={newHobby}
									onChange={(e) => setNewHobby(e.target.value)}
									placeholder="Add hobby"
									className="flex-1 border px-3 py-2 rounded"
								/>
								<button
									type="button"
									onClick={addHobby}
									className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
								>
									Add
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{profileForm.hobbies.map((h, i) => (
									<div
										key={i}
										className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded"
									>
										<span>{h}</span>
										<button
											type="button"
											onClick={() => removeHobby(i)}
											className="text-red-500 font-bold"
										>
											&times;
										</button>
									</div>
								))}
							</div>
						</div>
						{/* Education */}
						<div>
							<h4 className="font-semibold mb-2">Education</h4>
							{profileForm.education.map((edu, i) => (
								<div key={i} className="flex gap-2 mb-2">
									<input
										type="text"
										placeholder="School"
										value={edu.school}
										onChange={(e) =>
											handleEducationChange(i, "school", e.target.value)
										}
										className="border px-2 py-1 rounded flex-1"
									/>
									<input
										type="text"
										placeholder="Degree"
										value={edu.degree}
										onChange={(e) =>
											handleEducationChange(i, "degree", e.target.value)
										}
										className="border px-2 py-1 rounded flex-1"
									/>
									<input
										type="text"
										placeholder="Year"
										value={edu.year}
										onChange={(e) =>
											handleEducationChange(i, "year", e.target.value)
										}
										className="border px-2 py-1 rounded w-24"
									/>
									<button
										type="button"
										onClick={() => removeEducation(i)}
										className="text-red-500 font-bold"
									>
										&times;
									</button>
								</div>
							))}
							<button
								type="button"
								onClick={addEducation}
								className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Add Education
							</button>
						</div>
						{/* Work */}
						<div>
							<h4 className="font-semibold mb-2">Work</h4>
							{profileForm.work.map((w, i) => (
								<div key={i} className="flex gap-2 mb-2">
									<input
										type="text"
										placeholder="Company"
										value={w.company}
										onChange={(e) =>
											handleWorkChange(i, "company", e.target.value)
										}
										className="border px-2 py-1 rounded flex-1"
									/>
									<input
										type="text"
										placeholder="Position"
										value={w.position}
										onChange={(e) =>
											handleWorkChange(i, "position", e.target.value)
										}
										className="border px-2 py-1 rounded flex-1"
									/>
									<input
										type="text"
										placeholder="From"
										value={w.from}
										onChange={(e) =>
											handleWorkChange(i, "from", e.target.value)
										}
										className="border px-2 py-1 rounded w-20"
									/>
									<input
										type="text"
										placeholder="To"
										value={w.to}
										onChange={(e) => handleWorkChange(i, "to", e.target.value)}
										className="border px-2 py-1 rounded w-20"
									/>
									<button
										type="button"
										onClick={() => removeWork(i)}
										className="text-red-500 font-bold"
									>
										&times;
									</button>
								</div>
							))}
							<button
								type="button"
								onClick={addWork}
								className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
							>
								Add Work
							</button>
						</div>
						<button
							type="submit"
							className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
						>
							Save Changes
						</button>
					</form>
				)}

				{/* display following and follower  */}
				<div className="flex font-bold text-sm bg-gray-100 rounded-md overflow-hidden">
					<Dialog>
						<form>
							<DialogTrigger asChild>
								<div
									className="flex flex-col bg-white p-2  cursor-pointer hover:bg-gray-100"
									onClick={displayFollowing}
								>
									following <span>{following.length}</span>
								</div>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogTitle>
									{" "}
									<p className="font-bold">Following</p>
								</DialogTitle>
								<div>
									{showFollowing && (
										<div className="h-96 overflow-auto">
											{following.map((val) => (
												<div key={val._id}>
													{" "}
													<div className="flex gap-2 hover:bg-gray-800 hover:text-white p-2 text-sm rounded-xl bg-gray-100 ">
														{" "}
														<Image
															className="h-10 w-10 rounded-full"
															src={`/blank-pp.jpg`}
															alt="pp"
															width={10}
															height={10}
														/>
														<div className="flex flex-col">
															<p>{val.fullName}</p>
															<p>{val.email}</p>
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</DialogContent>
						</form>
					</Dialog>
					<div className="flex font-bold max-h-96 text-sm bg-gray-100 ">
						<Dialog>
							<form>
								<DialogTrigger asChild>
									<div
										className="flex flex-col bg-white p-2  cursor-pointer hover:bg-gray-100"
										onClick={displayFollowers}
									>
										followers <span>{followers.length}</span>
									</div>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[425px]">
									<DialogTitle>
										<p className="font-bold">Followers</p>
									</DialogTitle>
									<div>
										{showFollowers && (
											<div className="h-[400px] overflow-auto">
												{followers.map((val) => (
													<div key={val._id}>
														<div className="flex gap-2 hover:bg-green-200 p-2 text-sm rounded-xl bg-gray-100 ">
															{" "}
															<Image
																className="h-10 w-10 rounded-full"
																src={`/blank-pp.jpg`}
																alt="pp"
																width={10}
																height={10}
															/>
															<div className="flex flex-col">
																<p>{val.fullName}</p>
																<p>{val.email}</p>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</DialogContent>
							</form>
						</Dialog>
					</div>
				</div>
				{/* show following and followers list  */}

				{/* User Posts */}
				{posts.length > 0 ? (
					posts.map((post) => {
						const liked = post.likes?.includes(userId);

						return (
							<div
								key={post._id}
								className="bg-white rounded-md shadow-md hover:shadow-xl transition-shadow duration-300 p-6 mb-6 border border-gray-200"
							>
								<div className="flex items-start content-start w-full gap-3">
									<div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
										<img
											className="rounded-[50%]"
											src="/blank-pp.jpg"
											height="80px"
											width="80px"
										/>
									</div>
									<div>
										<p className="font-semibold text-gray-800">
											{post.author?.fullName}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(post.createdAt).toLocaleString()}
										</p>
									</div>
								</div>

								<div className="flex mt-4 flex-col items-start text-gray-700 leading-relaxed mb-4 break-all w-md">
									{editingPostId === post._id ? (
										<div className="flex gap-2 mb-3">
											<input
												value={editPostContent}
												onChange={(e) => setEditPostContent(e.target.value)}
												className="border flex-1 px-2 py-1 rounded"
											/>
											<button
												onClick={() => updatePost(post._id)}
												className="bg-green-500 text-white px-2 rounded"
											>
												save
											</button>
											<button
												onClick={() => setEditingPostId(null)}
												className="bg-gray-400 text-white px-2 rounded"
											>
												cancel
											</button>
										</div>
									) : (
										<div className="w-full">
											<Link
												href={`/${userId}/posts/${post._id}`}
												className="flex flex-col gap-4 items-center justify-between mb-3"
											>
												<span className="break-all text-center text-2xl text-green-700 w-full">
													{post.content}
												</span>
											</Link>
											{post.author?._id === userId && (
												<div className="flex gap-2 justify-between items-center text-xs mt-2">
													<div className="flex gap-2">
														<button
															onClick={() => toggleLike(post._id)}
															className={`px-3 py-1 rounded text-white ${
																liked
																	? "bg-red-600 hover:bg-red-700"
																	: "bg-green-600 hover:bg-green-700"
															}`}
														>
															{liked ? "Unlike" : "Like"}
														</button>
														<div>
															{post.likes?.length || 0}{" "}
															{post.likes?.length === 1 ? (
																<span>Like</span>
															) : (
																<span>Likes</span>
															)}
														</div>
													</div>
													<div className="flex gap-2">
														<button
															onClick={() => {
																setEditingPostId(post._id);
																setEditPostContent(post.content);
															}}
															className="bg-gray-500 text-white px-2 py-1 rounded"
														>
															Edit
														</button>
														<button
															onClick={() => deletePost(post._id)}
															className="bg-red-500 text-white px-2 rounded"
														>
															Delete
														</button>
													</div>
												</div>
											)}
										</div>
									)}
								</div>

								<div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
									{/* <button
										onClick={() => toggleLike(post._id)}
										className={`px-3 py-1 rounded text-white ${
											liked
												? "bg-red-600 hover:bg-red-700"
												: "bg-green-600 hover:bg-green-700"
										}`}
									>
										{liked ? "Unlike" : "Like"}
									</button>

									<span>
										{post.likes?.length || 0}{" "}
										{post.likes?.length === 1 ? "Like" : "Likes"}
									</span> */}
									{/* --------- POST EDIT MODE ---- */}
									{/* {editingPostId === post._id ? (
										<div className="flex gap-2 mb-3">
											<input
												value={editPostContent}
												onChange={(e) => setEditPostContent(e.target.value)}
												className="border flex-1 px-2 py-1 rounded"
											/>
											<button
												onClick={() => updatePost(post._id)}
												className="bg-green-500 text-white px-2 rounded"
											>
												save
											</button>
											<button
												onClick={() => setEditingPostId(null)}
												className="bg-gray-400 text-white px-2 rounded"
											>
												cancel
											</button>
										</div>
									) : (
										post.author?._id === userId && (
											<div className="flex gap-2 text-xs mt-2">
												<button
													onClick={() => {
														setEditingPostId(post._id);
														setEditPostContent(post.content);
													}}
													className="bg-gray-500 text-white px-2 py-1 rounded"
												>
													Edit
												</button>
												<button
													onClick={() => deletePost(post._id)}
													className="bg-red-500 text-white px-2 rounded"
												>
													Delete
												</button>
											</div>
										)
									)} */}
								</div>

								{/* ===== COMMENTS ===== */}
								<div className="border-t pt-2 mt-3">
									<h3 className="text-sm font-semibold text-gray-700 mb-2">
										Comments
									</h3>

									{post.comments?.length === 0 ? (
										<p className="text-sm text-gray-500">No comments yet</p>
									) : (
										post.comments.map((c) => (
											<div
												key={c._id}
												className="mb-2 flex justify-between items-start gap-2 text-sm"
											>
												<div className="flex-1">
													<div className="flex gap-2">
														<p className="font-semibold">{c.user.fullName}:</p>
														<p className="text-gray-600">{c.text}</p>
													</div>
													<p className="text-xs text-gray-400">
														{new Date(c.createdAt).toLocaleString()}
													</p>

													{/* COMMENT EDIT MODE */}
													{editingCommentId === c._id && (
														<div className="flex gap-2 mt-1">
															<input
																value={editCommentText}
																onChange={(e) =>
																	setEditCommentText(e.target.value)
																}
																className="border px-2 py-1 rounded text-sm"
															/>
															<button
																onClick={() => updateComment(post._id, c._id)}
																className="bg-green-500 text-white px-2 rounded text-xs"
															>
																save
															</button>
															<button
																onClick={() => setEditingCommentId(null)}
																className="bg-gray-400 text-white px-2 rounded text-xs"
															>
																cancel
															</button>
														</div>
													)}
												</div>

												{/* COMMENT ACTIONS (HIDDEN WHILE EDITING) */}
												{editingCommentId !== c._id && (
													<div className="flex gap-1">
														<button
															onClick={() => {
																setEditingCommentId(c._id);
																setEditCommentText(c.text);
															}}
															className="bg-gray-400 hover:bg-gray-500 rounded-md px-2 text-white"
														>
															edit
														</button>
														<button
															onClick={() => deleteComment(post._id, c._id)}
															className="bg-red-500 hover:bg-red-600 rounded-md px-2 text-white"
														>
															delete
														</button>
													</div>
												)}
											</div>
										))
									)}

									{/* ADD COMMENT */}
									<div className="mt-3 flex gap-2">
										<input
											type="text"
											placeholder="Write a comment..."
											value={commentText[post._id] || ""}
											onChange={(e) =>
												setCommentText((prev) => ({
													...prev,
													[post._id]: e.target.value,
												}))
											}
											className="flex-1 border px-3 py-1 rounded"
										/>
										<button
											onClick={() => addComment(post._id)}
											className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
										>
											Comment
										</button>
									</div>
								</div>
							</div>
						);
					})
				) : (
					<p className="text-gray-600">No posts found.</p>
				)}
			</div>
		</div>
	);
}
