// models/participant.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	const Participant = sequelize.define("Participant", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		azure_id: { type: DataTypes.STRING },
		role: { type: DataTypes.STRING },
	});

	return Participant;
};
