"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatBoard() {
  const { userId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ✅ Fetch all messages between sender & receiver
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/messages/${userId}/${receiverId}/getMessages`
      );
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // ✅ Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/messages/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: userId, receiver: receiverId, text }),
      });

      const data = await res.json();
      if (data.success) {
        setText("");
        fetchMessages(); // refresh chat
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, receiverId]);

  return (
    <main className="max-w-md mx-auto mt-10 p-4 border rounded-xl shadow">
      <h2 className="text-lg font-semibold text-center mb-4">
        Chat between {userId} & {receiverId}
      </h2>

      {/* ✅ Message List */}
      <div className="h-80 overflow-y-auto border p-3 rounded mb-3">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`my-2 p-2 rounded-md w-fit max-w-[80%] ${
                msg.sender === userId
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200"
              }`}
            >
              {msg.text}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
        )}
      </div>

      {/* ✅ Send Message Form */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </main>
  );
}
