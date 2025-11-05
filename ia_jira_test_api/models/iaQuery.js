// models/aiQuery.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const AiQuery = sequelize.define("AiQuery", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		question: { type: DataTypes.TEXT, allowNull: false },
		answer: { type: DataTypes.TEXT },
	});

	return AiQuery;
};
