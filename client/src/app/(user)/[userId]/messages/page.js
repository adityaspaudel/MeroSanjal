"use client";

import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

const UserMessageDashboard = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);

  // alert(userId);
  const getUserDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/${userId}/getFollowingFriendsList`
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
    <main className="min-h-full bg-green-200 overflow-auto text-black p-6">
      <div className="text-2xl font-bold">User Message Dashboard</div>
      {userDetails && (
        <div className=" flex flex-col gap-2 w-80">
          {userDetails.currentUser.following.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center bg-gray-100 hover:bg-green-300 p-2 rounded-md"
            >
              <div className="flex flex-col">
                <div>{user.fullName}</div>
                <div>{user.email}</div>
              </div>
              <button>Message</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default UserMessageDashboard;
