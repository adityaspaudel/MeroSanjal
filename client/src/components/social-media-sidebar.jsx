"use client";

import React, { useEffect, useState } from "react";
import { FaConnectdevelop, FaUserAlt } from "react-icons/fa";
import {
  IoHomeSharp,
  IoLogOut,
  IoSettingsSharp,
  IoMail,
} from "react-icons/io5";
import { RiSearchFill } from "react-icons/ri";
import { FaBell } from "react-icons/fa";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";
import { io } from "socket.io-client"; // ✅ import socket.io-client

export function SocialMediaSidebarComponent() {
  const params = useParams();
  const { userId } = params; // ✅ extract userId from route
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Socket instance
  const [socket, setSocket] = useState(null);

  // ✅ Fix: use the socket variable so ESLint doesn't warn
  useEffect(() => {
    if (socket) {
      console.log("🟢 Socket connected:", socket.id);
    }
  }, [socket]);

  useEffect(() => {
    const newSocket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    if (userId) {
      newSocket.emit("join", userId);
    }

    newSocket.on("updateUnreadCount", (data) => {
      setUnreadCount(data.count);
    });

    newSocket.on("newNotification", (data) => {
      console.log("🔔 New notification:", data);
    });

    return () => newSocket.disconnect();
  }, [userId]);

  // ✅ Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/users/${userId}`
        );
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  // ✅ Fetch unread notification count (initially only)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8000/users/${userId}/notifications/unreadNotificationCount`
        );
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    if (userId) fetchUnreadCount();
  }, [userId]);

  return (
    <div className=" flex flex-col bg-green-200 h-screen p-6 left-0 top-0 sticky">
      <div
        className="flex flex-col   w-[80px] sm:w-[100px] md:w-[100px] xl:w-[350px]
        justify-between  h-full border-r py-4 px-2 bg-gray-100 rounded-lg"
      >
        {/* -------- TOP SECTION -------- */}
        <div className="space-y-4 w-full  rounded-md">
          <Link href={`/${userId}/home`} className="flex gap-2 px-4">
            <FaConnectdevelop className="text-2xl" />
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight hover:underline hidden md:block">
              Mero Sanjal
            </h2>
          </Link>
          {/* -------- NAV LINKS -------- */}
          <div className="space-y-1 flex flex-col gap-2">
            {/* Home */}
            <Link href={`/${userId}/home`}>
              <Button
                variant="ghost"
                className="w-full justify-start  hover:bg-green-300"
              >
                <IoHomeSharp />
                <span className="hidden md:block ml-2">Home</span>
              </Button>
            </Link>
            {/* Search */}
            <Link href={`/${userId}/search`}>
              <Button
                variant="ghost"
                className="flex gap-2 w-full justify-start  hover:bg-green-300"
              >
                <RiSearchFill />
                <input
                  className="w-full bg-transparent focus:outline-none hidden md:block"
                  type="text"
                  placeholder="Search"
                />
              </Button>
            </Link>
            {/* Notifications (with badge) */}
            <Link href={`/${userId}/notifications`}>
              <Button
                variant="ghost"
                className="relative w-full justify-start  hover:bg-green-300"
              >
                <FaBell className="text-xl" />
                {/* ✅ Badge */}
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 left-6 bg-red-500 text-white text-[10px]
                    font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    {unreadCount > 10 ? "10+" : unreadCount}
                  </span>
                )}
                <span className="hidden md:block ml-2">Notifications</span>
              </Button>
            </Link>
            {/* Messages */}
            <Link href={`/${userId}/messages`}>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-green-300"
              >
                <IoMail />
                <span className=" hidden md:block ml-2">Messages</span>
              </Button>
            </Link>
            {/* Profile */}
            <Link href={`/${userId}/profile`}>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-green-300"
              >
                <FaUserAlt />
                <span className="hidden md:block ml-2">Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* -------- BOTTOM SECTION (User Info + Settings + Logout) -------- */}
        <div className="px-2 py-2 bg-gray-100 rounded-md">
          {user && (
            <div className="flex items-center space-x-2 rounded-md border hover:bg-green-300">
              <Link
                href={`/${userId}/profile`}
                className="flex items-center gap-2 "
              >
                <Avatar>
                  <AvatarImage src="/blank-pp.jpg" alt={user.fullName} />
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none hidden md:block">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    @{user.email.split("@")[0]}
                  </p>
                </div>
              </Link>
            </div>
          )}
          {/* Settings */}
          <Link href={`/${userId}/userSettings`}>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-green-300"
            >
              <IoSettingsSharp />
              <span className="logout hidden md:block ml-2">Setting</span>
            </Button>
          </Link>
          {/* Logout */}
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500  hover:text-white hover:bg-red-600 font-bold"
            >
              <IoLogOut />
              <span className="logout hidden md:block ml-2">Logout</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
