"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function IndividualPost() {
	const { userId, postId } = useParams();
	const router = useRouter();

	const [currentPost, setCurrentPost] = useState(null);

	// comment states
	const [commentText, setCommentText] = useState("");
	const [editingComment, setEditingComment] = useState(null);
	const [editCommentText, setEditCommentText] = useState("");

	// post edit states
	const [editingPost, setEditingPost] = useState(false);
	const [editContent, setEditContent] = useState("");

	// ================= FETCH POST =================
	const fetchPost = async () => {
		try {
			const { data } = await axios.get(
				`http://localhost:8000/${userId}/posts/${postId}/getPostById`
			);
			setCurrentPost(data);
		} catch (error) {
			console.error("Error fetching post:", error);
		}
	};

	useEffect(() => {
		if (postId) fetchPost();
	}, [postId]);

	// ================= LIKE / UNLIKE =================
	const toggleLike = async (postId) => {
		try {
			const { data } = await axios.put(
				`http://localhost:8000/posts/${postId}/like`,
				{ userId }
			);

			setCurrentPost((prev) => ({
				...prev,
				likes: data.liked
					? [...prev.likes, userId]
					: prev.likes.filter((id) => id !== userId),
			}));
		} catch (error) {
			console.error("Like error:", error);
		}
	};

	// ================= ADD COMMENT =================
	const addComment = async () => {
		if (!commentText.trim()) return;

		try {
			const { data } = await axios.post(
				`http://localhost:8000/posts/${currentPost._id}/comments`,
				{ userId, text: commentText }
			);

			setCurrentPost((prev) => ({
				...prev,
				comments: [...prev.comments, data.comment],
			}));

			setCommentText("");
		} catch (error) {
			console.error("Add comment error:", error);
		}
	};

	// ================= UPDATE COMMENT =================
	const updateComment = async (postId, commentId) => {
		if (!editCommentText.trim()) return;

		try {
			await axios.put(
				`http://localhost:8000/posts/${postId}/comments/${commentId}`,
				{ userId, text: editCommentText }
			);

			setCurrentPost((prev) => ({
				...prev,
				comments: prev.comments.map((c) =>
					c._id === commentId ? { ...c, text: editCommentText } : c
				),
			}));

			setEditingComment(null);
			setEditCommentText("");
		} catch (error) {
			console.error("Update comment error:", error);
		}
	};

	// ================= DELETE COMMENT =================
	const deleteComment = async (postId, commentId) => {
		try {
			await axios.delete(
				`http://localhost:8000/posts/${postId}/comments/${commentId}`,
				{ data: { userId } }
			);

			setCurrentPost((prev) => ({
				...prev,
				comments: prev.comments.filter((c) => c._id !== commentId),
			}));
		} catch (error) {
			console.error("Delete comment error:", error);
		}
	};

	// ================= UPDATE POST =================
	const updatePost = async (postId) => {
		if (!editContent.trim()) return;

		try {
			await axios.put(`http://localhost:8000/posts/${postId}`, {
				content: editContent,
			});

			setCurrentPost((prev) => ({
				...prev,
				content: editContent,
			}));

			setEditingPost(false);
			setEditContent("");
		} catch (error) {
			console.error("Update post error:", error);
		}
	};

	// ================= DELETE POST =================
	const deletePost = async (postId) => {
		try {
			await axios.delete(`http://localhost:8000/posts/${postId}`);
			router.back();
		} catch (error) {
			console.error("Delete post error:", error);
		}
	};

	if (!currentPost) return <p className="p-6">Loading...</p>;

	const liked = currentPost.likes.includes(userId);

	// ================= UI =================
	return (
		<div className="p-6 max-w-xl mx-auto bg-white border shadow rounded-sm">
			{/* BACK */}
			<button onClick={() => router.back()} className="text-xl mb-3">
				❮
			</button>

			{/* POST HEADER */}
			<div className="flex gap-2 mb-2">
				<img src="/blank-pp.jpg" className="h-10 w-10 rounded-full" />
				<div>
					<h2 className="font-bold">{currentPost.author.fullName}</h2>
					<p className="text-xs text-gray-500">
						{new Date(currentPost.createdAt).toLocaleString()}
					</p>
				</div>
			</div>

			{/* POST CONTENT */}
			{editingPost ? (
				<div className="flex gap-2 mb-3">
					<input
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
						className="border flex-1 px-2 py-1 rounded"
					/>
					<button
						onClick={() => updatePost(currentPost._id)}
						className="bg-green-500 text-white px-2 rounded"
					>
						Save
					</button>
					<button
						onClick={() => setEditingPost(false)}
						className="bg-gray-400 text-white px-2 rounded"
					>
						Cancel
					</button>
				</div>
			) : (
				<p className="mb-3">{currentPost.content}</p>
			)}
			{/* post actions like edit delete  */}
			<div className="flex justify-between items-center">
				{/* LIKE */}

				<div className="flex items-center gap-2 mb-4">
					<button
						onClick={() => toggleLike(currentPost._id)}
						className={`px-3 py-1 rounded text-white ${
							liked ? "bg-red-500" : "bg-green-500"
						}`}
					>
						{liked ? "Unlike" : "Like"}
					</button>
					<span className="text-sm">{currentPost.likes.length} likes</span>
				</div>

				{/* post edit or delete  */}
				<div>
					{currentPost.author._id === userId && !editingPost && (
						<div className="flex gap-2 mb-4">
							<button
								onClick={() => {
									setEditingPost(true);
									setEditContent(currentPost.content);
								}}
								className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
							>
								Edit
							</button>
							<button
								onClick={() => deletePost(currentPost._id)}
								className="bg-red-500 text-white px-3 py-1 rounded text-xs"
							>
								Delete
							</button>
						</div>
					)}
				</div>
			</div>
			{/* COMMENTS */}
			<h3 className="font-semibold text-sm mb-2">Comments</h3>

			{currentPost.comments.map((c) => (
				<div key={c._id} className="flex gap-2 bg-gray-50 p-2 mb-2 rounded">
					<p className="text-sm font-semibold">{c.user.fullName}:</p>
					{editingComment === c._id ? (
						<div className="flex gap-2 mt-1">
							<input
								value={editCommentText}
								onChange={(e) => setEditCommentText(e.target.value)}
								className="border flex-1 px-2  rounded text-sm"
							/>
							<button
								onClick={() => updateComment(currentPost._id, c._id)}
								className="bg-green-500 text-white px-2 rounded text-xs"
							>
								Save
							</button>
							<button
								onClick={() => setEditingComment(null)}
								className="bg-gray-400 text-white px-2 rounded text-xs"
							>
								Cancel
							</button>
						</div>
					) : (
						<div className="text-sm flex flex-col">
							<span>{c.text}</span>
							<span className="text-gray-400 text-xs">
								{" "}
								{new Date(c.createdAt).toLocaleString()}
							</span>
						</div>
					)}

					{c.user._id === userId && (
						<div className="flex gap-2 mt-1 text-white text-xs">
							<button
								onClick={() => {
									setEditingComment(c._id);
									setEditCommentText(c.text);
								}}
								className="bg-blue-500 hover:bg-blue-600 px-2 rounded-sm "
							>
								Edit
							</button>
							<button
								onClick={() => deleteComment(currentPost._id, c._id)}
								className="bg-red-500 hover:bg-red-600 px-2 rounded-sm"
							>
								Delete
							</button>
						</div>
					)}
				</div>
			))}

			{/* ADD COMMENT */}
			<div className="flex gap-2 mt-3">
				<input
					value={commentText}
					onChange={(e) => setCommentText(e.target.value)}
					placeholder="Write a comment..."
					className="border flex-1 px-2 py-1 rounded"
				/>
				<button
					onClick={addComment}
					className="bg-green-500 text-white px-3 rounded"
				>
					Comment
				</button>
			</div>
		</div>
	);
}
