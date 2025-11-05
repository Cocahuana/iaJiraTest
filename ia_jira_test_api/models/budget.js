// models/budget.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Budget = sequelize.define("Budget", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		initial_budget: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
		},
		initial_investment: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
		},
		expected_roi: {
			type: DataTypes.DECIMAL(5, 2), // Percentage
			allowNull: false,
			defaultValue: 0,
		},
		needed_personnel: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		personnel_budget: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
		},
		personnel_list: {
			type: DataTypes.JSONB, // Array of user IDs with their allocated budget
			defaultValue: [],
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: "active", // active, completed, cancelled
		},
		description: {
			type: DataTypes.TEXT,
		},
		start_date: {
			type: DataTypes.DATE,
		},
		end_date: {
			type: DataTypes.DATE,
		},
	});

	return Budget;
};

