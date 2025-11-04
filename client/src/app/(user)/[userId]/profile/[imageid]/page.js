"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const IndividualProfilePhotos = () => {
  const { imageid } = useParams();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/images/${imageid}`);
        if (!res.ok) throw new Error("Image not found");

        const data = await res.json();
        setImageData(data);
      } catch (err) {
        console.error("Failed to fetch image:", err);
      } finally {
        setLoading(false);
      }
    };

    if (imageid) fetchImage();
  }, [imageid]);

  const toggleComments = () => setShowComments(!showComments);

  return (
    <div className="relative flex justify-center items-start min-h-screen bg-gray-100 p-4">
      {loading ? (
        <p className="text-gray-600 text-lg">Loading image...</p>
      ) : imageData ? (
        <>
          {/* Main Post Card */}
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {imageData.user?.username || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(imageData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-xl">
                ⋮
              </button>
            </div>

            {/* Image */}
            <img
              src={imageData.imageUrl}
              alt={imageData.description}
              className="w-full object-cover"
            />

            {/* Description */}
            <div className="p-4">
              <p className="text-gray-800">{imageData.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex gap-4 text-gray-600">
                <button className="hover:text-red-500">❤️</button>
                <button
                  onClick={toggleComments}
                  className="hover:text-blue-500"
                >
                  💬
                </button>
                <button className="hover:text-green-500">🔗</button>
              </div>
              <p className="text-sm text-gray-400">0 likes</p>
            </div>
          </div>

          {/* Comment Sidebar */}
          <div
            className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ${
              showComments ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Comments</h2>
              <button
                onClick={toggleComments}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Comment List (placeholder) */}
            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-130px)]">
              <div className="text-gray-600">
                No comments yet. Be the first!
              </div>
              {/* Later: Map over real comments */}
            </div>

            {/* Add Comment Input */}
            <div className="p-4 border-t">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-lg">Image not found.</p>
      )}
    </div>
  );
};

export default IndividualProfilePhotos;
