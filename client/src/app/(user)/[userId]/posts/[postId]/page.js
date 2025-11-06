"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function IndividualPost() {
  const { userId, postId } = useParams();
  const router = useRouter();

  const [currentPost, setCurrentPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);

  // Fetch single post
  const fetchPost = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/${userId}/posts/${postId}/getPostById`
      );
      setCurrentPost(data);
    } catch (error) {
      console.error("Error fetching individual post:", error);
    }
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  // ✅ Toggle Like / Unlike
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
      console.error("Error liking/unliking post:", error);
    }
  };

  // ✅ Add Comment
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
      console.error("Error adding comment:", error);
    }
  };

  // ✅ Update Comment
  const updateComment = async (postId, commentId) => {
    if (!editCommentText.trim()) return;
    try {
      const { data } = await axios.put(
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
        { userId, text: editCommentText }
      );
      console.log(data);
      setCurrentPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { ...c, text: editCommentText } : c
        ),
      }));

      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // ✅ Delete Comment
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
      console.error("Error deleting comment:", error);
    }
  };

  if (!currentPost) return <p className="p-6">Loading...</p>;

  const liked = currentPost.likes.includes(userId);

  return (
    <div className="flex flex-col gap-2 items-center p-6 max-w-2xl border rounded shadow min-h-full bg-green-200">
      {/* 🔙 Back Button */}
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

      {/* ✅ Post Details */}
      <div className="flex flex-col gap-2 p-4 w-full bg-white rounded-lg shadow border">
        {/* ✅ Author & Date */}
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              className="rounded-full"
              src="/cartoon-cute.jpg"
              height="40px"
              width="40px"
              alt="Author"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-gray-800">
                {currentPost.author.fullName}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(currentPost.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{currentPost.content}</p>
        </div>

        {/* ✅ Likes */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <button
            onClick={() => toggleLike(currentPost._id)}
            className={`px-3 py-1 rounded text-white ${
              liked
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {liked ? "Unlike" : "Like"}
          </button>
          <span>
            {currentPost.likes.length}{" "}
            {currentPost.likes.length !== 1 ? "Likes" : "Like"}
          </span>
        </div>

        {/* ✅ Comments Section */}
        <div className="border-t pt-2 flex flex-col content-start items-start">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Comments</h3>

          <div className="flex flex-col gap-2 w-full">
            {currentPost.comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet</p>
            ) : (
              currentPost.comments.map((c) => (
                <div
                  key={c._id}
                  className="flex justify-between items-start bg-gray-50 rounded p-2 w-full"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{c.user.fullName}</p>

                    {editingComment === c._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="border rounded px-2 py-1 text-sm flex-1"
                        />
                        <button
                          onClick={() => updateComment(currentPost._id, c._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{c.text}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* ✅ Edit & Delete Buttons */}
                  {c.user._id === userId && (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => {
                          setEditingComment(c._id);
                          setEditCommentText(c.text);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 px-2 py-1 text-white rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(currentPost._id, c._id)}
                        className="bg-red-500 hover:bg-red-600 rounded-md py-1 px-2 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ✅ Add new comment */}
          <div className="mt-3 flex gap-2 w-full">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-400 px-3 py-1 rounded"
            />
            <button
              onClick={addComment}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
