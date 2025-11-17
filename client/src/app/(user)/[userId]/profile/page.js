"use client";

import { React, useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const [newHobby, setNewHobby] = useState("");
  const [following, setFollowing] = useState("");
  const [followers, setFollowers] = useState("");

  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [editCommentText, setEditCommentText] = useState("");

  // Fetch profile (user info + posts)
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:8000/users/${userId}/profile`
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

  // Add comment
  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    try {
      const { data } = await axios.post(
        `http://localhost:8000/posts/${postId}/comments`,
        { userId, text }
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
        `http://localhost:8000/users/${userId}/profile`,
        formData
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
        `http://localhost:8000/posts/${postId}/comments/${commentId}`,
        { userId, text: editCommentText } // only userId and text
      );
      console.log("data", data);
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

  if (loading) return <p className="text-gray-600">Loading profile...</p>;
  if (!user) return <p className="text-red-500">User not found</p>;

  return (
    <div className="p-8 flex flex-col gap-2 min-h-full w-md bg-green-200">
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
          <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
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
                  onChange={(e) => handleWorkChange(i, "from", e.target.value)}
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
              <Link
                href={`/${userId}/posts/${post._id}`}
                className="flex flex-col gap-4 items-center justify-between mb-3"
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

                <p className="flex items-start text-gray-700 leading-relaxed mb-4 break-all w-md">
                  <span className="break-all text-center text-2xl text-green-700">
                    {post.content}
                  </span>
                </p>
              </Link>
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
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
                <span>
                  {post.likes?.length || 0}{" "}
                  {post.likes?.length === 1 ? "Like" : "Likes"}
                </span>
              </div>

              <div className="border-t pt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Comments
                </h3>

                {post.comments?.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet</p>
                ) : (
                  post.comments.map((c) => (
                    <div
                      key={c._id}
                      className="mb-2 flex justify-between items-center gap-2 text-sm"
                    >
                      <div>
                        <div className="flex gap-2">
                          <p className="text-sm font-semibold">
                            {c.user.fullName}:
                          </p>
                          <p className="text-sm text-gray-600">{c.text}</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={updateComment}
                          className="bg-gray-400 hover:bg-gray-500 rounded-md px-2 text-white"
                        >
                          edit
                        </button>
                        <button
                          onClick={deleteComment}
                          className="bg-red-500 hover:bg-red-600 rounded-md px-2 text-white"
                        >
                          delete
                        </button>
                      </div>
                      {editingComment && (
                        <input type="text" placeholder="enter" value="" />
                      )}
                    </div>
                  ))
                )}

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
  );
}
