// controllers/notification_controller.js
const { Notification, User, Project } = require("../db.js");
const { Op } = require("sequelize");

// Get all notifications
async function getAllNotifications(req, res) {
	try {
		const notifications = await Notification.findAll({
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
					required: false,
				},
			],
			order: [["createdAt", "DESC"]],
		});
		res.json({ success: true, notifications });
	} catch (error) {
		console.error("Error fetching notifications:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get notifications by user
async function getNotificationsByUser(req, res) {
	try {
		const { userId } = req.params;
		const { status } = req.query;

		const where = { user_id: userId };
		if (status) {
			where.status = status;
		}

		const notifications = await Notification.findAll({
			where,
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
					required: false,
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.json({ success: true, notifications });
	} catch (error) {
		console.error("Error fetching user notifications:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get unread notifications count
async function getUnreadCount(req, res) {
	try {
		const { userId } = req.params;

		const count = await Notification.count({
			where: {
				user_id: userId,
				status: "unread",
			},
		});

		res.json({ success: true, count });
	} catch (error) {
		console.error("Error fetching unread count:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create notification
async function createNotification(req, res) {
	try {
		const {
			user_id,
			project_id,
			type,
			title,
			message,
			priority,
			metadata,
		} = req.body;

		const notification = await Notification.create({
			user_id,
			project_id,
			type,
			title,
			message,
			priority,
			metadata,
		});

		const notificationWithDetails = await Notification.findByPk(
			notification.id,
			{
				include: [
					{
						model: User,
						attributes: ["id", "name", "email"],
					},
					{
						model: Project,
						attributes: ["id", "name"],
						required: false,
					},
				],
			}
		);

		res.json({ success: true, notification: notificationWithDetails });
	} catch (error) {
		console.error("Error creating notification:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Mark notification as read
async function markAsRead(req, res) {
	try {
		const { id } = req.params;

		const notification = await Notification.findByPk(id);
		if (!notification) {
			return res
				.status(404)
				.json({ success: false, error: "Notification not found" });
		}

		await notification.update({
			status: "read",
			read_at: new Date(),
		});

		res.json({ success: true, notification });
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Mark all notifications as read for a user
async function markAllAsRead(req, res) {
	try {
		const { userId } = req.params;

		await Notification.update(
			{
				status: "read",
				read_at: new Date(),
			},
			{
				where: {
					user_id: userId,
					status: "unread",
				},
			}
		);

		res.json({ success: true, message: "All notifications marked as read" });
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Dismiss notification
async function dismissNotification(req, res) {
	try {
		const { id } = req.params;

		const notification = await Notification.findByPk(id);
		if (!notification) {
			return res
				.status(404)
				.json({ success: false, error: "Notification not found" });
		}

		await notification.update({ status: "dismissed" });

		res.json({ success: true, notification });
	} catch (error) {
		console.error("Error dismissing notification:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Delete notification
async function deleteNotification(req, res) {
	try {
		const { id } = req.params;

		const notification = await Notification.findByPk(id);
		if (!notification) {
			return res
				.status(404)
				.json({ success: false, error: "Notification not found" });
		}

		await notification.destroy();

		res.json({
			success: true,
			message: "Notification deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting notification:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	getAllNotifications,
	getNotificationsByUser,
	getUnreadCount,
	createNotification,
	markAsRead,
	markAllAsRead,
	dismissNotification,
	deleteNotification,
};

