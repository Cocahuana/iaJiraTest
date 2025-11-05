// models/financial.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Financial = sequelize.define("Financial", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		budget: { type: DataTypes.DECIMAL(12, 2) },
		spent: { type: DataTypes.DECIMAL(12, 2) },
		forecast: { type: DataTypes.DECIMAL(12, 2) },
	});

	return Financial;
};
