"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";

// Connect to backend socket server
const socket = io("http://localhost:8000");

export default function ChatBoard() {
  const { userId, receiverId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);

  // ------------------ FETCH USER DATA ------------------

  const fetchUser = async (id, setUser) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (e) {
      console.error("User fetch error", e);
    }
  };

  useEffect(() => {
    fetchUser(userId, setSender);
    fetchUser(receiverId, setReceiver);
  }, [userId, receiverId]);

  // ------------------ FETCH OLD MESSAGES ------------------

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/messages/${userId}/${receiverId}/getMessages`
      );
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [userId, receiverId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ------------------ SOCKET JOIN ------------------

  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);
    }

    // Listen for new incoming messages
    socket.on("newMessage", (msg) => {
      console.log("📩 Real-time message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [userId]);

  // ------------------ SEND MESSAGE ------------------

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await fetch("http://localhost:8000/messages/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: userId,
          receiver: receiverId,
          text,
        }),
      });

      setText("");
      // NO NEED TO FETCH AGAIN — socket will handle real-time update!
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ------------------ UI ------------------

  return (
    <main className="flex flex-col min-h-screen mx-auto p-4 border w-[600px] shadow-lg bg-green-200 fixed">
      <h1 className="text-center text-2xl font-bold">Messages</h1>

      <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-green-600 bg-white rounded-tr-2xl rounded-tl-2xl rounded-br-2xl p-2">
            {receiver?.author?.fullName || "Receiver"}
          </span>

          <span className="text-blue-600 bg-white rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl p-2">
            {sender?.author?.fullName || "You"} (You)
          </span>
        </div>
      </h2>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto border p-3 rounded bg-white mb-3 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isSender = msg.sender?._id === userId;

            return (
              <div
                key={index}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[60%] shadow ${
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-green-500 text-white rounded-bl-none"
                  }`}
                >
                  <div>{msg.text}</div>
                  <p className="text-[8px] mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center mt-10">
            No messages yet — start the conversation 💬
          </p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>
    </main>
  );
}
