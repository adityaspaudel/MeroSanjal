"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";

const HomeComponent = () => {
  const { userId } = useParams();
  // const author = userId;
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // ✅ for multiple image uploads
  const [commentText, setCommentText] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  // ✅ Fetch followed users' posts
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

  // ✅ Handle image selection (up to 5)
  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      alert("You can upload up to 5 images only!");
      return;
    }
    setImages(selected);
  };

  // ✅ Create Post with images
  const createPost = async () => {
    if (!content.trim() && images.length === 0)
      return alert("Add text or images");

    try {
      const formData = new FormData();
      formData.append("author", userId);
      formData.append("content", content);
      images.forEach((img) => formData.append("images", img));

      await axios.post("http://localhost:8000/posts/createPost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setContent("");
      setImages([]);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // ✅ Update Post (text only)
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

  // ✅ Delete Post
  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:8000/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // ✅ Like/Unlike Post
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

  // ✅ Add Comment
  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const { data } = await axios.post(
        `http://localhost:8000/posts/${postId}/comments`,
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

  // ✅ Update Comment
  const updateComment = async (postId, commentId) => {
    if (!editCommentText.trim()) return;
    try {
      await axios.put(
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
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

  // ✅ Delete Comment
  const deleteComment = async (postId, commentId) => {
    try {
      await axios.delete(
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
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

  return (
    <div className="p-6 w-full mx-auto bg-green-200">
      {/* ✅ Create Post */}
      <div className="mb-6 w-full">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a post..."
          className="w-full border p-2 rounded mb-2"
        />
        {/* ✅ Upload multiple images */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mb-2"
        />
        {/* ✅ Image Previews */}
        <div className="flex gap-2 flex-wrap mb-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(img)}
              alt={`preview-${idx}`}
              className="w-24 h-24 object-cover rounded border"
            />
          ))}
        </div>

        <button
          onClick={createPost}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Post
        </button>
      </div>

      {/* ✅ Posts List */}
      <div className="space-y-6">
        {posts.map((post) => {
          const liked = post.likes.includes(userId);
          const isAuthor = post.author?._id === userId;

          return (
            <div
              key={post._id}
              className="flex flex-col gap-2 border p-4 rounded-lg shadow bg-white"
            >
              {/* ✅ Author Info */}
              <Link href={`/${userId}/posts/${post._id}`} className="block">
                <div className="flex gap-2">
                  <img
                    src={post.author?.profilePic || "/cartoon-cute.jpg"}
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
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

              {/* ✅ Post Content */}
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
                <>
                  <p className="mt-2 text-gray-900 text-lg">{post.content}</p>
                  {/* ✅ Show uploaded images */}
                  {post.imagesUrl?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {post.imagesUrl.map((img, idx) => (
                        <img
                          key={idx}
                          src={`${img}`}
                          alt={`post-${idx}`}
                          className="w-32 h-32 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ✅ Like + Edit/Delete Buttons */}
              <div className="mt-3 flex gap-4 justify-between items-center text-sm text-gray-600">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLike(post._id)}
                    className={`px-3 py-1 rounded-md text-white ${
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

                {isAuthor && (
                  <div className="flex gap-2">
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
                      className="bg-red-500 hover:bg-red-600 text-white px-2 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* ✅ Comments Section */}
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
                              className="border px-2 py-1 rounded flex-1"
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
                            <div className="flex justify-between">
                              <span>
                                <strong>{c.user.fullName}:</strong> {c.text}
                              </span>
                              {isCommentAuthor && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingComment(c._id);
                                      setEditCommentText(c.text);
                                    }}
                                    className="px-2 bg-gray-500 text-white rounded-md"
                                  >
                                    edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteComment(post._id, c._id)
                                    }
                                    className="px-2 bg-red-500 text-white rounded-md"
                                  >
                                    delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Add Comment Input */}
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
                    className="border p-2 rounded flex-1"
                  />
                  <button
                    onClick={() => addComment(post._id)}
                    className="bg-green-500 text-white px-2 rounded-md"
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
