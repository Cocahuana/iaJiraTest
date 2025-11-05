// models/sprintCost.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const SprintCost = sequelize.define("SprintCost", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		allocated_budget: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		expected_cost: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
		},
		actual_cost: {
			type: DataTypes.DECIMAL(12, 2),
			defaultValue: 0,
		},
		overrun_amount: {
			type: DataTypes.DECIMAL(12, 2),
			defaultValue: 0,
		},
		overrun_reason: {
			type: DataTypes.TEXT,
		},
		hourly_rate: {
			type: DataTypes.DECIMAL(10, 2),
		},
		hours_worked: {
			type: DataTypes.DECIMAL(10, 2),
		},
	});

	return SprintCost;
};

