"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
const HomeComponent = () => {
	const { userId } = useParams();
	const [posts, setPosts] = useState([]);
	const [content, setContent] = useState("");
	const [images, setImages] = useState([]);
	const [commentText, setCommentText] = useState({});
	const [editingPost, setEditingPost] = useState(null);
	const [editContent, setEditContent] = useState("");
	const [editingComment, setEditingComment] = useState(null);
	const [editCommentText, setEditCommentText] = useState("");
	const [loading, setLoading] = useState(true);
	const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
	useEffect(() => {
		fetchPosts();
	}, [userId]);

	const fetchPosts = async () => {
		try {
			const { data } = await axios.get(
				`${NEXT_PUBLIC_API_URL}/posts/${userId}/following`
			);
			setPosts(data.posts || []);
		} catch (error) {
			console.error("Error fetching posts:", error);
			alert(JSON.stringify(error, 2, 2));
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {
		const selected = Array.from(e.target.files);
		if (selected.length > 5) {
			alert("You can upload up to 5 images only!");
			return;
		}
		setImages(selected);
	};

	const createPost = async () => {
		if (!content.trim() && images.length === 0)
			return alert("Add text or images");

		try {
			const formData = new FormData();
			formData.append("author", userId);
			formData.append("content", content);
			images.forEach((img) => formData.append("images", img));

			await axios.post(`${NEXT_PUBLIC_API_URL}/posts/createPost`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			setContent("");
			setImages([]);
			fetchPosts();
		} catch (error) {
			alert(JSON.stringify(error, 2, 2));
		}
	};

	const updatePost = async (postId) => {
		if (!editContent.trim()) return;

		try {
			await axios.put(`${NEXT_PUBLIC_API_URL}/posts/${postId}`, {
				content: editContent,
			});
			setPosts((prev) =>
				prev.map((p) => (p._id === postId ? { ...p, content: editContent } : p))
			);
			setEditingPost(null);
			setEditContent("");
		} catch (error) {
			console.error("Error updating post:", error);
		}
	};

	const deletePost = async (postId) => {
		try {
			await axios.delete(`${NEXT_PUBLIC_API_URL}/posts/${postId}`);
			setPosts((prev) => prev.filter((p) => p._id !== postId));
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	const toggleLike = async (postId) => {
		try {
			const { data } = await axios.put(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/like`,
				{ userId }
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
						: p
				)
			);
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const addComment = async (postId) => {
		const text = commentText[postId];
		if (!text?.trim()) return;

		try {
			const { data } = await axios.post(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
				{ userId, postId, text }
			);
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? { ...p, comments: [...p.comments, data.comment] }
						: p
				)
			);
			setCommentText((prev) => ({ ...prev, [postId]: "" }));
		} catch (error) {
			console.error("Error adding comment:", error);
		}
	};

	const updateComment = async (postId, commentId) => {
		if (!editCommentText.trim()) return;
		try {
			await axios.put(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${commentId}`,
				{ userId, text: editCommentText }
			);
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? {
								...p,
								comments: p.comments.map((c) =>
									c._id === commentId ? { ...c, text: editCommentText } : c
								),
						  }
						: p
				)
			);
			setEditingComment(null);
			setEditCommentText("");
		} catch (error) {
			console.error("Error updating comment:", error);
		}
	};
	if (loading) {
		return (
			<div className="p-6 max-w-xl mx-auto animate-pulse">
				{/* Create Post Skeleton */}
				<div className="mb-6 p-4 rounded-sm bg-white shadow-lg border space-y-3">
					<div className="h-20 bg-gray-300 rounded-sm"></div>
					{/* <div className="h-4 w-32 bg-gray-300 rounded-sm"></div> */}

					<div className="flex gap-2 flex-wrap">
						<div className="w-24 h-8 bg-gray-300 rounded-sm"></div>
						<div className="w-24 h-8 bg-gray-300 rounded-sm"></div>
					</div>

					<div className="h-10 w-24 bg-gray-300 rounded-sm"></div>
				</div>

				{/* Posts Skeleton */}
				<div className="space-y-6">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="flex flex-col gap-4 p-4 rounded-sm shadow-md border bg-white"
						>
							{/* Author */}
							<div className="flex gap-3 items-center">
								<div className="w-12 h-12 bg-gray-300 rounded-full"></div>
								<div className="space-y-2">
									<div className="h-4 w-32 bg-gray-300 rounded"></div>
									<div className="h-3 w-24 bg-gray-300 rounded"></div>
								</div>
							</div>

							{/* Post Content */}
							<div className="space-y-2">
								<div className="h-4 bg-gray-300 rounded w-full"></div>
								<div className="h-4 bg-gray-300 rounded w-5/6"></div>
								<div className="h-4 bg-gray-300 rounded w-2/3"></div>
							</div>

							{/* Images */}
							<div className="flex gap-2 flex-wrap justify-center">
								<div className="w-32 h-32 bg-gray-300 rounded-sm"></div>
								<div className="w-32 h-32 bg-gray-300 rounded-sm"></div>
							</div>

							{/* Actions */}
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center">
									<div className="h-8 w-20 bg-gray-300 rounded-sm"></div>
									<div className="h-4 w-16 bg-gray-300 rounded"></div>
								</div>
								<div className="flex gap-2">
									<div className="h-8 w-16 bg-gray-300 rounded-sm"></div>
									<div className="h-8 w-16 bg-gray-300 rounded-sm"></div>
								</div>
							</div>

							{/* Comments */}
							<div className="bg-gray-200 p-4 rounded-sm space-y-3">
								<div className="h-4 w-24 bg-gray-300 rounded"></div>

								<div className="space-y-2">
									<div className="h-3 bg-gray-300 rounded w-full"></div>
									<div className="h-3 bg-gray-300 rounded w-5/6"></div>
								</div>

								<div className="flex gap-2">
									<div className="h-10 flex-1 bg-gray-300 rounded-sm"></div>
									<div className="h-10 w-20 bg-gray-300 rounded-sm"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}
	const deleteComment = async (postId, commentId) => {
		try {
			await axios.delete(
				`${NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${commentId}`,
				{ data: { userId } }
			);
			setPosts((prev) =>
				prev.map((p) =>
					p._id === postId
						? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
						: p
				)
			);
		} catch (error) {
			console.error("Error deleting comment:", error);
		}
	};

	const normalizeImages = (imagesUrl) => {
		if (!imagesUrl) return [];
		if (Array.isArray(imagesUrl)) return imagesUrl;
		return [imagesUrl];
	};

	const getImageUrl = (img) => {
		if (!img) return "";

		let url = String(img).trim();

		//  remove accidental backend prefix if exists
		if (url.includes("https://res.cloudinary.com")) {
			url = url.substring(url.indexOf("https://res.cloudinary.com"));
		}

		//  Cloudinary or any external URL
		if (/^https?:\/\//i.test(url)) {
			return url;
		}

		//  Local uploads (old posts)
		return `${NEXT_PUBLIC_API_URL}/${url}`;
	};

	return (
		<div className="p-6 max-w-xl mx-auto min-h-full ">
			{/* Create Post */}
			<div className="mb-6 p-4 rounded-sm bg-white shadow-lg border ">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="What's on your mind?"
					className="w-full border rounded-sm p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
				/>
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={handleImageChange}
					className="mb-2"
					title="Upload images"
				/>
				<div className="flex gap-2 flex-wrap mb-2">
					{images.map((img, idx) => (
						<img
							key={idx}
							src={URL.createObjectURL(img)}
							alt={`preview-${idx}`}
							className="w-24 h-24 object-cover rounded-sm border"
						/>
					))}
				</div>
				<button
					onClick={createPost}
					className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-sm transition-colors"
				>
					Post
				</button>
			</div>

			{/* Posts */}
			<div className="space-y-6">
				{posts.map((post) => {
					const liked = post.likes.includes(userId);
					const isAuthor = post.author?._id === userId;

					return (
						<div
							key={post._id}
							className="flex flex-col gap-3 p-4  rounded-sm shadow-md border  bg-white hover:shadow-xl transition-shadow"
						>
							{/* Author Info */}
							<Link
								href={`/${userId}/posts/${post._id}`}
								className="flex gap-3 items-center"
							>
								<img
									src={post.author?.profilePic || "/blank-pp.jpg"}
									alt="profile"
									className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
								/>
								<div>
									<h3 className="font-semibold text-gray-800 text-lg">
										{post.author?.fullName || "Unknown"}
									</h3>
									<p className="text-gray-500 text-sm">
										{new Date(post.createdAt).toLocaleString()}
									</p>
								</div>
							</Link>

							{/* Post Content */}
							{editingPost === post._id ? (
								<div className="flex flex-col gap-2">
									<textarea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="border p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									<div className="flex gap-2">
										<button
											onClick={() => updatePost(post._id)}
											className="bg-gray-600 text-white px-3 py-1 rounded-sm"
										>
											Save
										</button>
										<button
											onClick={() => setEditingPost(null)}
											className="bg-gray-400 text-white px-3 py-1 rounded-sm"
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									<p className="mt-2 text-gray-800 break-words text-lg">
										{post.content}
									</p>

									{normalizeImages(post.imagesUrl).length > 0 && (
										<div className="flex gap-2 flex-wrap mt-2 justify-center items-center overflow-y-scroll">
											{normalizeImages(post.imagesUrl).map((img, idx) => (
												<Dialog key={idx}>
													<DialogTrigger asChild>
														<img
															src={getImageUrl(img)}
															alt={`post-${idx}`}
															className="w-32 h-32 object-cover rounded-sm cursor-pointer"
														/>
													</DialogTrigger>

													<DialogContent className="sm:max-w-[800px] sm:max-h-[600px] flex flex-col justify-center items-center bg-white rounded-sm p-4">
														<div
															className="w-[400px] text-wrap break-all
"
														>
															<DialogTitle>{getImageUrl(img)}</DialogTitle>
														</div>
														<img
															src={getImageUrl(img)}
															alt={`post-${idx}`}
															className="h-[400px] object-contain rounded-sm"
														/>
													</DialogContent>
												</Dialog>
											))}
										</div>
									)}
								</>
							)}

							{/* Actions */}
							<div className="mt-3 flex flex-wrap gap-3 justify-between  items-center text-sm text-gray-600">
								<div className="flex gap-2 items-center flex-wrap">
									<button
										onClick={() => toggleLike(post._id)}
										className={`px-4 py-1 rounded-sm text-white font-medium transition-colors ${
											liked
												? "bg-red-600 hover:bg-red-700"
												: "bg-green-600 hover:bg-green-700"
										}`}
									>
										{liked ? "Unlike" : "Like"}
									</button>
									<span className="pt-1">
										{post.likes.length}{" "}
										{post.likes.length === 1 ? "Like" : "Likes"}
									</span>
								</div>

								{isAuthor && (
									<div className="flex gap-2 flex-wrap">
										<button
											onClick={() => {
												setEditingPost(post._id);
												setEditContent(post.content);
											}}
											className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-sm"
										>
											Edit
										</button>
										<button
											onClick={() => deletePost(post._id)}
											className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-sm"
										>
											Delete
										</button>
									</div>
								)}
							</div>

							{/* Comments */}
							<div className="mt-4 bg-gray-200 p-4 rounded-sm">
								<h4 className="font-bold text-gray-600 mb-2">Comments:</h4>
								<ul className="flex flex-col gap-2">
									{post.comments?.map((c) => {
										const isCommentAuthor = c.user._id === userId;
										return (
											<li
												key={c._id}
												className="text-sm flex flex-col border-b pb-1"
											>
												{editingComment === c._id ? (
													<div className="flex gap-2 flex-wrap">
														<input
															value={editCommentText}
															onChange={(e) =>
																setEditCommentText(e.target.value)
															}
															className="border px-2 py-1 rounded-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400"
														/>
														<button
															onClick={() => updateComment(post._id, c._id)}
															className="px-2 py-1 bg-gray-600 text-white rounded-sm"
														>
															Save
														</button>
														<button
															onClick={() => setEditingComment(null)}
															className="px-2 py-1 bg-gray-400 text-white rounded-sm"
														>
															Cancel
														</button>
													</div>
												) : (
													<div className="flex flex-col gap-1">
														<div className="flex justify-between items-center flex-wrap">
															<span>
																<strong>{c.user.fullName}:</strong> {c.text}
															</span>
															{isCommentAuthor && (
																<div className="flex gap-2 flex-wrap">
																	<button
																		onClick={() => {
																			setEditingComment(c._id);
																			setEditCommentText(c.text);
																		}}
																		className="px-2 bg-gray-500 hover:bg-gray-600 text-white rounded-sm"
																	>
																		Edit
																	</button>
																	<button
																		onClick={() =>
																			deleteComment(post._id, c._id)
																		}
																		className="px-2 bg-red-500 hover:bg-red-600 text-white rounded-sm"
																	>
																		Delete
																	</button>
																</div>
															)}
														</div>
														<span className="text-xs text-gray-500">
															{new Date(c.createdAt).toLocaleString()}
														</span>
													</div>
												)}
											</li>
										);
									})}
								</ul>

								<div className="mt-2 flex gap-2 flex-wrap">
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
										className="border p-2 rounded-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400 hover:border-black"
									/>
									<button
										onClick={() => addComment(post._id)}
										className="bg-green-500 text-white px-3 py-2 rounded-sm hover:bg-green-600 transition-colors"
									>
										Comment
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default HomeComponent;
