// models/notification.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Notification = sequelize.define("Notification", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false, // budget_overrun, sprint_ending, burnout_alert, vacation_reminder, time_entry_missing
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		priority: {
			type: DataTypes.STRING,
			defaultValue: "medium", // low, medium, high, critical
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "unread", // unread, read, dismissed, actioned
		},
		sent_via: {
			type: DataTypes.STRING, // email, teams, in_app
		},
		sent_at: {
			type: DataTypes.DATE,
		},
		read_at: {
			type: DataTypes.DATE,
		},
		metadata: {
			type: DataTypes.JSONB, // Additional data specific to notification type
		},
	});

	return Notification;
};

