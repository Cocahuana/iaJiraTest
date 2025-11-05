// src/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, NODE_ENV } = process.env;

// Configuración Sequelize
let sequelize =
	NODE_ENV === "production"
		? new Sequelize({
				database: DB_NAME,
				dialect: "postgres",
				host: DB_HOST,
				port: 5432,
				username: DB_USER,
				password: DB_PASSWORD,
				pool: { max: 3, min: 1, idle: 10000 },
				dialectOptions: {
					ssl: {
						require: true,
						rejectUnauthorized: false,
					},
					keepAlive: true,
				},
				ssl: true,
				logging: false,
		  })
		: new Sequelize(
				`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
				{ logging: false, native: false }
		  );

const basename = path.basename(__filename);

// Cargar todos los modelos de /models
const modelDefiners = [];
fs.readdirSync(path.join(__dirname, "/models"))
	.filter(
		(file) =>
			file.indexOf(".") !== 0 &&
			file !== basename &&
			file.slice(-3) === ".js"
	)
	.forEach((file) => {
		modelDefiners.push(
			require(path.join(__dirname, "/models", file))
		);
	});

// Inyectar conexión
modelDefiners.forEach((model) => model(sequelize));

// Capitalizar nombres
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map(([name, model]) => [
	name[0].toUpperCase() + name.slice(1),
	model,
]);
sequelize.models = Object.fromEntries(capsEntries);

// Extraer modelos
const {
	User,
	Company,
	Project,
	Team,
	Participant,
	Task,
	AiQuery,
	Financial,
	Vacation,
	Sprint,
	SprintCost,
	TimeEntry,
	Notification,
	BurnoutMetric,
	Budget,
} = sequelize.models;

// Relaciones existentes
Company.hasMany(Project, { foreignKey: "company_id" });
Project.belongsTo(Company, { foreignKey: "company_id" });

Project.hasMany(Team, { foreignKey: "project_id" });
Team.belongsTo(Project, { foreignKey: "project_id" });

Team.hasMany(Participant, { foreignKey: "team_id" });
Participant.belongsTo(Team, { foreignKey: "team_id" });

User.hasMany(Participant, { foreignKey: "user_id" });
Participant.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

User.hasMany(Task, { foreignKey: "assignee_id" });
Task.belongsTo(User, { foreignKey: "assignee_id" });

User.hasMany(AiQuery, { foreignKey: "user_id" });
AiQuery.belongsTo(User, { foreignKey: "user_id" });

Project.hasOne(Financial, { foreignKey: "project_id" });
Financial.belongsTo(Project, { foreignKey: "project_id" });

// Budgets
Project.hasMany(Budget, { foreignKey: "project_id" });
Budget.belongsTo(Project, { foreignKey: "project_id" });

// Nuevas relaciones
// Vacations
User.hasMany(Vacation, { foreignKey: "user_id" });
Vacation.belongsTo(User, { foreignKey: "user_id" });

// Sprints
Project.hasMany(Sprint, { foreignKey: "project_id" });
Sprint.belongsTo(Project, { foreignKey: "project_id" });

// Sprint Costs
Sprint.hasMany(SprintCost, { foreignKey: "sprint_id" });
SprintCost.belongsTo(Sprint, { foreignKey: "sprint_id" });

User.hasMany(SprintCost, { foreignKey: "user_id" });
SprintCost.belongsTo(User, { foreignKey: "user_id" });

// Time Entries
User.hasMany(TimeEntry, { foreignKey: "user_id" });
TimeEntry.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(TimeEntry, { foreignKey: "project_id" });
TimeEntry.belongsTo(Project, { foreignKey: "project_id" });

Task.hasMany(TimeEntry, { foreignKey: "task_id" });
TimeEntry.belongsTo(Task, { foreignKey: "task_id" });

// Notifications
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Notification, { foreignKey: "project_id" });
Notification.belongsTo(Project, { foreignKey: "project_id" });

// Burnout Metrics
User.hasMany(BurnoutMetric, { foreignKey: "user_id" });
BurnoutMetric.belongsTo(User, { foreignKey: "user_id" });

Team.hasMany(BurnoutMetric, { foreignKey: "team_id" });
BurnoutMetric.belongsTo(Team, { foreignKey: "team_id" });

module.exports = {
	...sequelize.models, // Importar así: const { User, Project } = require('./db.js');
	conn: sequelize, // Importar la conexión { conn } = require('./db.js');
};
