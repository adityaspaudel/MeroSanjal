"use client";

import { React, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AllUsers() {
  const params = useParams();
  const currentUserId = params.userId; // extract from route

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/getAllUsers");
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        const usersWithFollowStatus = (
          Array.isArray(data.users) ? data.users : []
        ).map((user) => ({
          ...user,
          isFollowing: user.followers?.includes(currentUserId) || false,
        }));
        setUsers(usersWithFollowStatus);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  const toggleFollow = async (userId) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(
        `http://localhost:8000/${currentUserId}/toggleFollowUnfollow`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingTo: userId }),
        }
      );
      if (!response.ok) throw new Error("Failed to toggle follow");

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to toggle follow");
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-600 h-screen w-80 bg-green-100">
        Loading users...
      </p>
    );
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 min-h-full bg-green-200 ">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center bg-gray-100 hover:bg-green-300 justify-between gap-3 p-4  shadow rounded-lg min-w-[200px] flex-1"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-gray-800">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {user._id !== currentUserId && (
                <button
                  onClick={() => toggleFollow(user._id)}
                  disabled={updating[user._id]}
                  className={`px-2 py-1 text-sm rounded-md ${
                    user.isFollowing
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {updating[user._id]
                    ? "..."
                    : user.isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
