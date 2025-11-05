// routes/notification_routes.js
const express = require("express");
const router = express.Router();
const {
	getAllNotifications,
	getNotificationsByUser,
	getUnreadCount,
	createNotification,
	markAsRead,
	markAllAsRead,
	dismissNotification,
	deleteNotification,
} = require("../controllers/notification_controller");

router.get("/", getAllNotifications);
router.get("/user/:userId", getNotificationsByUser);
router.get("/user/:userId/unread-count", getUnreadCount);
router.post("/", createNotification);
router.put("/:id/read", markAsRead);
router.put("/user/:userId/read-all", markAllAsRead);
router.put("/:id/dismiss", dismissNotification);
router.delete("/:id", deleteNotification);

module.exports = router;

