// models/user.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const User = sequelize.define("User", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		auth0_id: {
			type: DataTypes.STRING,
			unique: true,
		},
	});

	return User;
};
