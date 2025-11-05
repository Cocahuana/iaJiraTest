// models/task.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Task = sequelize.define("Task", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		status: { type: DataTypes.STRING, allowNull: false },
		priority: { type: DataTypes.STRING },
		due_date: { type: DataTypes.DATE },
	});

	return Task;
};
