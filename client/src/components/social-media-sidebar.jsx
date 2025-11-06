"use client";

import React from "react";
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
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export function SocialMediaSidebarComponent() {
  const params = useParams();
  const { userId } = params; // ✅ extract userId from route
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // ✅ Fetch unread notification count
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

    // Optional: auto-refresh every 10s
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div
      className="flex flex-col left-0 top-0 sticky h-screen w-[80px] sm:w-[100px] md:w-[100px] xl:w-[350px]
      bg-green-100 justify-between border-r p-4"
    >
      {/* -------- TOP SECTION -------- */}
      <div className="space-y-4 w-full ">
        <Link href={`/${userId}/home`} className="flex gap-2 px-4">
          <FaConnectdevelop className="text-2xl" />
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight hover:underline hidden md:block">
            Mero Sanjal
          </h2>
        </Link>

        {/* -------- NAV LINKS -------- */}
        <div className="space-y-1">
          {/* Home */}
          <Link href={`/${userId}/home`}>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100"
            >
              <IoHomeSharp />
              <span className="hidden md:block ml-2">Home</span>
            </Button>
          </Link>

          {/* Search */}
          <Link href={`/${userId}/search`}>
            <Button
              variant="ghost"
              className="flex gap-2 w-full justify-start hover:bg-gray-100"
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
              className="relative w-full justify-start hover:bg-gray-100"
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
              className="w-full justify-start hover:bg-gray-100"
            >
              <IoMail />
              <span className=" hidden md:block ml-2">Messages</span>
            </Button>
          </Link>

          {/* Profile */}
          <Link href={`/${userId}/profile`}>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-100"
            >
              <FaUserAlt />
              <span className="hidden md:block ml-2">Profile</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* -------- BOTTOM SECTION (User Info + Settings + Logout) -------- */}
      <div className="space-y-1 p-2">
        {user && (
          <div className="flex items-center space-x-2 rounded-md border hover:bg-gray-100">
            <Link
              href={`/${userId}/profile`}
              className="flex items-center gap-2"
            >
              <Avatar>
                <AvatarImage src="/cartoon-cute.jpg" alt={user.fullName} />
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
            className="w-full justify-start hover:bg-gray-100"
          >
            <IoSettingsSharp />
            <span className="logout hidden md:block ml-2">Setting</span>
          </Button>
        </Link>

        {/* Logout */}
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-gray-100 font-bold"
          >
            <IoLogOut />
            <span className="logout hidden md:block ml-2">Logout</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
