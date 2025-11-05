// models/burnoutMetric.js
// import { DataTypes } from "sequelize";
const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
	const BurnoutMetric = sequelize.define("BurnoutMetric", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		hours_worked: {
			type: DataTypes.DECIMAL(5, 2),
		},
		overtime_hours: {
			type: DataTypes.DECIMAL(5, 2),
		},
		tasks_completed: {
			type: DataTypes.INTEGER,
		},
		tasks_overdue: {
			type: DataTypes.INTEGER,
		},
		burnout_score: {
			type: DataTypes.DECIMAL(5, 2), // 0-100 scale
			allowNull: false,
		},
		stress_level: {
			type: DataTypes.STRING, // low, medium, high, critical
			defaultValue: "low",
		},
		notes: {
			type: DataTypes.TEXT,
		},
	});

	return BurnoutMetric;
};

