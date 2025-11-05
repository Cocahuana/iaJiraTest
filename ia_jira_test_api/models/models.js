// models/company.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Company = sequelize.define("Company", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: { type: DataTypes.STRING, allowNull: false },
		azure_org: { type: DataTypes.STRING },
	});

	return Company;
};
