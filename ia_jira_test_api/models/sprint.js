// models/sprint.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Sprint = sequelize.define("Sprint", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		azure_id: {
			type: DataTypes.STRING,
			unique: true,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "active", // planned, active, completed
		},
		budget: {
			type: DataTypes.DECIMAL(12, 2),
		},
		velocity: {
			type: DataTypes.INTEGER,
		},
		completed_points: {
			type: DataTypes.INTEGER,
		},
	});

	return Sprint;
};

