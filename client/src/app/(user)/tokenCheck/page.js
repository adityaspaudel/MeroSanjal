import { getuserIdFromToken } from "@/lib/auth";
import React from "react";
export default async function Dashboard() {
  const userId = getuserIdFromToken();

  if (!userId) return <p>Not authenticated</p>;

  const res = await fetch(`http://localhost:8000/user/${userId}`, {
    cache: "no-store",
  });

  const user = await res.json();
  console.log(user);
  if (!userId) {
    return <p>Please log in</p>;
  }

  return <h1>Welcome, User ID: {userId}</h1>;
}
