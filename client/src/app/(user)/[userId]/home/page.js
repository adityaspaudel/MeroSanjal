"use client";

import React from "react";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";

const HomeComponent = () => {
  // logged-in user
  const { userId } = useParams();

  console.log("userId: ", userId);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  // Fetch All Posts of followed users
  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/posts/${userId}/following`
      );
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // 🆕Create Post
  const createPost = async () => {
    if (!content.trim()) return;
    try {
      await axios.post("http://localhost:8000/posts/createPost", {
        author: userId,
        content,
      });
      setContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // ⬆️Update Post
  const updatePost = async (postId) => {
    if (!editContent.trim()) return;
    try {
      await axios.put(`http://localhost:8000/posts/${postId}`, {
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

  // Delete Post
  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:8000/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Like/Unlike
  const toggleLike = async (postId) => {
    try {
      const { data } = await axios.put(
        `http://localhost:8000/posts/${postId}/like`,
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

  // ➕ Add Comment
  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const { data } = await axios.post(
        `http://localhost:8000/posts/${postId}/comments`,
        {
          userId,
          postId,
          text,
        }
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

  // ✅ Update Comment
  const updateComment = async (postId, commentId) => {
    if (!editCommentText.trim()) return;

    try {
      const { data } = await axios.put(
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
        { userId, text: editCommentText } // only userId and text
      );
      console.log(data);
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
      console.error(
        "Error updating comment:",
        error.response?.data || error.message
      );
    }
  };

  // Delete Comment
  const deleteComment = async (postId, commentId) => {
    try {
      await axios.delete(
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
        { data: { userId } } // only send userId
      );

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) }
            : p
        )
      );
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="p-6 w-full mx-auto bg-green-200">
      {/* Create Post */}

      <div className="mb-6 w-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a post..."
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={createPost}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => {
          const liked = post.likes.includes(userId);
          const isAuthor = post.author?._id === userId;

          return (
            <div
              key={post._id}
              className="flex flex-col gap-2 border p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              {/* Author Info */}
              <Link href={`/${userId}/posts/${post._id}`} className="block">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                    <img
                      className="rounded-[50%]"
                      src="/cartoon-cute.jpg"
                      height="80px"
                      width="80px"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {post.author?.fullName || "Unknown"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
              {/* Post Content */}
              {editingPost === post._id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePost(post._id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="bg-gray-400 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-900 text-lg">{post.content}</p>
              )}

              {/* Like + Edit/Delete Post */}
              <div className="mt-3 flex gap-4 justify-between items-center text-sm text-gray-600">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className={`px-3 py-1 rounded-md text-sm text-white ${
                      liked
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {liked ? "Unlike" : "Like"}
                  </button>
                  <div className="pt-2">
                    {post.likes.length}{" "}
                    {post.likes.length === 1 ? "Like" : "Likes"}
                  </div>
                </div>

                <div className="flex gap-2">
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPost(post._id);
                          setEditContent(post.content);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePost(post._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2  rounded-md"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ✅ Comments */}
              <div className="mt-4">
                <h4 className="font-bold text-gray-600">Comments:</h4>
                <ul className="mt-2 flex flex-col gap-2">
                  {post.comments?.map((c) => {
                    const isCommentAuthor = c.user._id === userId;
                    return (
                      <li
                        key={c._id}
                        className="text-sm flex flex-col border-b pb-1"
                      >
                        {editingComment === c._id ? (
                          <div className="flex gap-2">
                            <input
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className="border border-gray-400 px-2 py-1 rounded flex-1"
                            />
                            <button
                              onClick={() => updateComment(post._id, c._id)}
                              className="px-2 py-1 bg-gray-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingComment(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-4 justify-between items-center w-full">
                              <span>
                                <strong>{c.user.fullName || "User"}:</strong>{" "}
                                <span>{c.text}</span>
                              </span>
                              {/*  */}
                              <div>
                                {isCommentAuthor && (
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => {
                                        setEditingComment(c._id);
                                        setEditCommentText(c.text);
                                      }}
                                      className="px-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                                    >
                                      edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteComment(post._id, c._id)
                                      }
                                      className="px-2 py  bg-red-500  hover:bg-red-600 text-white rounded-md"
                                    >
                                      delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/*  */}
                            <span className="text-xs text-gray-500">
                              <span>
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Add Comment */}
                <div className="mt-2 flex gap-2">
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
                    className="border border-gray-400 p-2 rounded flex-1"
                  />
                  <button
                    onClick={() => addComment(post._id)}
                    className="bg-green-500 text-white px-2  rounded-md hover:bg-green-600"
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
