const express = require("express");

const router = express.Router();

const {
	getNotifications,
	readUnreadNotifications,
	getUnreadNotificationCount,
} = require("../controllers/notificationController");
const { markMessagesAsRead } = require("../controllers/messageController");

// getNotifications route
router.get("/users/:userId/notifications", getNotifications);

// readUnreadNotifications route
router.put(
	"/users/:userId/notifications/:notificationId/read",
	readUnreadNotifications
);

router.get(
	"/users/:userId/notifications/unreadNotificationCount",
	getUnreadNotificationCount
);

module.exports = router;
