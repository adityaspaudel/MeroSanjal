const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");

const createNotification = async ({
  recipient,
  sender,
  type,
  postId,
  message,
}) => {
  try {
    if (recipient.toString() === sender.toString()) return;
    const newNotification = new Notification({
      recipient,
      sender,
      type,
      post: postId || null,
      message,
    });
    await newNotification.save();
  } catch (error) {
    console.error("❌ Error creating notification:", error.message);
  }
};

// get notifications
// ---------------- GET /users/:userId/notifications ----------------
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "fullName email")
      .populate("post", "content")
      .sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// ---------------- PUT /users/:userId/notifications/:notificationId/read ----------------

const readUnreadNotifications = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Error updating notification:", error.message);
    res.status(500).json({ message: "Error updating notification" });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error.message);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  readUnreadNotifications,
  getUnreadNotificationCount,
};
