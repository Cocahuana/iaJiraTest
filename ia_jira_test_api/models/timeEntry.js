// models/timeEntry.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const TimeEntry = sequelize.define("TimeEntry", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		hours: {
			type: DataTypes.DECIMAL(5, 2),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
		},
		billable: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		billed: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		approved: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		approved_by: {
			type: DataTypes.UUID,
		},
		approved_at: {
			type: DataTypes.DATE,
		},
	});

	return TimeEntry;
};

