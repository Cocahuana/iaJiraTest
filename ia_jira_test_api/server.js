// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de APIs
const JIRA_DOMAIN = process.env.JIRA_DOMAIN;
const JIRA_USER = process.env.JIRA_USER;
const JIRA_TOKEN = process.env.JIRA_TOKEN;

// Import routes
// const jiraRoutes = require("./routes/jira_routes.js");
const azureRoutes = require("./routes/azure_routes.js");
const vacationRoutes = require("./routes/vacation_routes.js");
const sprintRoutes = require("./routes/sprint_routes.js");
const budgetRoutes = require("./routes/budget_routes.js");
const timeentryRoutes = require("./routes/timeentry_routes.js");
const notificationRoutes = require("./routes/notification_routes.js");
const burnoutRoutes = require("./routes/burnout_routes.js");

// Use routes
// app.use("/api/jira", jiraRoutes);
app.use("/api/azure", azureRoutes);
app.use("/api/vacations", vacationRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/timeentries", timeentryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/burnout", burnoutRoutes);
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para priorizar backlog con IA
app.get("/api/prioritize-backlog", async (req, res) => {
	try {
		const issues = await getJiraIssues();
		const { issues: prioritizedIssues, suggestedPriorities } =
			await prioritizeWithAI(issues);

		res.json({
			success: true,
			originalCount: issues.length,
			prioritizedIssues,
			suggestedPriorities,
			summary: `IA ha sugerido prioridades para ${prioritizedIssues.length} tareas`,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Función para obtener issues de Jira
async function getJiraIssues() {
	try {
		const jqlQuery = encodeURIComponent(
			"project=SCRUM ORDER BY created DESC"
		);
		const url = `https://${JIRA_DOMAIN}/rest/api/2/search?jql=${jqlQuery}&fields=summary,description,priority,status,assignee`;

		const response = await axios.get(url, {
			auth: {
				username: JIRA_USER,
				password: JIRA_TOKEN,
			},
			headers: {
				Accept: "application/json",
			},
		});

		return response.data.issues.map((issue) => ({
			key: issue.key,
			summary: issue.fields.summary,
			description: issue.fields.description || "Sin descripción",
			priority: issue.fields.priority?.name || "No asignada",
			status: issue.fields.status?.name || "Sin estado",
			assignee: issue.fields.assignee?.displayName || "Sin asignar",
			created: issue.fields.created,
		}));
	} catch (error) {
		console.error(
			"Error al obtener issues de Jira:",
			error.response?.data || error.message
		);
		throw new Error("No se pudo conectar con Jira");
	}
}

// Función de priorización con IA (modificada)
async function prioritizeWithAI(issues) {
	try {
		const prompt = `
      Como experto en gestión de proyectos SCRUM, analiza estas tareas y:
      1. Sugiere una nueva prioridad (Highest, High, Medium, Low, Lowest)
      2. Proporciona una breve razón para el cambio
      
      Tareas actuales:
      ${JSON.stringify(issues, null, 2)}
      
      Devuelve un JSON con:
      - issues: Array de tareas ordenadas
      - suggestedPriorities: Array con {key, suggestedPriority, reason}
      
      Ejemplo de respuesta:
      {
        "issues": [...tareas ordenadas...],
        "suggestedPriorities": [
          {
            "key": "SCRUM-1",
            "suggestedPriority": "High",
            "reason": "Es fundamental para el inicio del proyecto"
          }
        ]
      }
    `;

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{ role: "system", content: "Devuelve solo JSON válido" },
				{ role: "user", content: prompt },
			],
			response_format: { type: "json_object" },
			temperature: 0.3,
		});

		const response = JSON.parse(completion.choices[0].message.content);
		return response;
	} catch (error) {
		console.error("Error en prioritizeWithAI:", error);
		throw error;
	}
}

// Función de fallback para ordenar por prioridad
function sortByPriority(issues) {
	const priorityOrder = {
		Highest: 1,
		High: 2,
		Medium: 3,
		Low: 4,
		Lowest: 5,
		"No asignada": 6,
	};

	return [...issues].sort((a, b) => {
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});
}

// Endpoint de prueba
app.get("/api/jira-test", async (req, res) => {
	try {
		const issues = await getJiraIssues();
		res.json({
			success: true,
			issues: issues,
			count: issues.length,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Nueva interfaz para la priorización sugerida

// Endpoint para actualizar prioridades en Jira
app.post("/api/update-priorities", async (req, res) => {
	try {
		const { priorities } = req.body;

		// Actualizar cada ticket en Jira
		const updateResults = await Promise.all(
			priorities.map(async (item) => {
				try {
					await updateJiraPriority(item.key, item.suggestedPriority);
					return { success: true, key: item.key };
				} catch (error) {
					return {
						success: false,
						key: item.key,
						error: error.message,
					};
				}
			})
		);

		res.json({
			success: true,
			updated: updateResults.filter((r) => r.success).length,
			failed: updateResults.filter((r) => !r.success).length,
			details: updateResults,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

// Función para actualizar prioridad en Jira
async function updateJiraPriority(issueKey, priority) {
	// Mapeo de prioridades sugeridas a IDs de prioridad en Jira
	const priorityMap = {
		Highest: "1",
		High: "2",
		Medium: "3",
		Low: "4",
		Lowest: "5",
	};

	const priorityId = priorityMap[priority] || "3"; // Default a Medium

	const url = `https://${JIRA_DOMAIN}/rest/api/2/issue/${issueKey}`;

	await axios.put(
		url,
		{
			fields: {
				priority: { id: priorityId },
			},
		},
		{
			auth: {
				username: JIRA_USER,
				password: JIRA_TOKEN,
			},
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
}
// ====================== //
// 📆 CRON DE RESÚMENES AI Y RECORDATORIOS //
// ====================== //
const cron = require("node-cron");
const { generateSummary } = require("./services/openaiSummaryService");
const reminderService = require("./services/reminderService");

// Simulación: logs o reportes diarios (podés reemplazarlo con datos reales de tu DB o Azure)
async function getDailyProjectLogs() {
	return [
		{
			title: "Sprint 25 - Análisis de desempeño",
			logs: [
				"El proyecto ABC incrementó el costo un 12% respecto al presupuesto.",
				"El usuario Juan Pérez no registró horas esta semana.",
				"El burnout del equipo de desarrollo aumentó un 8%.",
				"Las tareas críticas SCRUM-134 y SCRUM-141 siguen abiertas.",
			],
		},
		{
			title: "Proyecto XYZ - Seguimiento semanal",
			logs: [
				"El sprint se cerró con 94% de cumplimiento.",
				"Se detectaron tareas duplicadas en backlog.",
				"Costos dentro de lo esperado, sin alertas.",
			],
		},
	];
}

// Ejecuta cada día a las 08:00 AM - Resúmenes AI
cron.schedule("0 8 * * *", async () => {
	console.log("🕗 Generando resúmenes automáticos de proyectos...");

	const reports = await getDailyProjectLogs();
	for (const report of reports) {
		const resumen = await generateSummary(report.title, report.logs);
		console.log(`🧠 ${report.title}:\n${resumen}\n`);
		// ⚙️ Próximamente: guardar en DB o enviar por email/Teams
	}
});

// Ejecuta cada día a las 09:00 AM - Recordatorios y alertas
cron.schedule("0 9 * * *", async () => {
	console.log("🔔 Ejecutando verificación de recordatorios y alertas...");
	await reminderService.runAllChecks();
});

// Ejecuta cada hora - Verificación de burnout crítico
cron.schedule("0 * * * *", async () => {
	console.log("🔥 Verificando alertas de burnout crítico...");
	await reminderService.checkBurnoutAlerts();
});

// Ejecuta cada día a las 18:00 - Verificación de time entries
cron.schedule("0 18 * * *", async () => {
	console.log("⏰ Verificando time entries faltantes...");
	await reminderService.checkMissingTimeEntries();
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
