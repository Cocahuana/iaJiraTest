// models/vacation.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Vacation = sequelize.define("Vacation", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "vacation", // vacation, sick_leave, personal
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "approved", // pending, approved, rejected
		},
		notes: {
			type: DataTypes.TEXT,
		},
	});

	return Vacation;
};

