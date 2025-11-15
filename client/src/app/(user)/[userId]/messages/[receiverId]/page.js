"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatBoard() {
  const { userId, receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sender, setSender] = useState(userId);
  const [receiver, setReceiver] = useState(receiverId);

  // get sender
  const getSender = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`);
      const data = await response.json();
      setSender(data);
    } catch (error) {
      console.error("error occurred");
    } finally {
      console.log("completed");
    }
  }, [userId]);

  // get receiver
  const getReceiver = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/user/${receiverId}`);
      const data = await response.json();
      setReceiver(data);
    } catch (error) {
      console.error("error occurred");
    } finally {
      console.log("completed");
    }
  }, [receiverId]);

  useEffect(() => {
    getSender();
    getReceiver();
  }, [getSender, getReceiver]);

  // ✅ Fetch all messages
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

  // ✅ Send message
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
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId, receiverId]);

  setTimeout(() => {
    fetchMessages();
  }, [10000]);

  console.log(messages);
  return (
    <main className=" mx-auto  p-4 border  shadow-lg bg-green-200 h-full">
      <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">
        Chat between{" "}
        <div className="flex justify-between items-center">
          <span className="text-blue-600">
            {receiver[0]?.author?.fullName}
            {/* <pre>{JSON.stringify(sender, 2, 2)}</pre> */}
          </span>{" "}
          &{" "}
          <span className="text-green-600">
            {sender[0]?.author?.fullName} (You)
          </span>
        </div>
      </h2>

      {/* ✅ Messages Area */}
      <div className="h-96 overflow-y-auto border p-3 rounded bg-white mb-3 space-y-2">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isSender = msg.sender._id === userId;
            return (
              <div
                key={index}
                className={`flex ${
                  isSender
                    ? "justify-end items-end"
                    : "justify-start items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] shadow ${
                    isSender
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
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
      {/* ✅ Input Area */}
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
