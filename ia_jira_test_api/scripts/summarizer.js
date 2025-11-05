import "dotenv/config";
import OpenAI from "openai";
import fetch from "node-fetch";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Simulación: obtendremos datos desde Azure o Jira
// (más adelante conectamos con la API real)
async function getProjectData() {
	const azureData = await fetch(
		`https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/workitems?api-version=7.0`,
		{
			headers: {
				Authorization: `Basic ${Buffer.from(
					":" + process.env.AZURE_PAT
				).toString("base64")}`,
			},
		}
	).then((r) => r.json());

	return azureData.value || [];
}

async function summarizeSprint(data) {
	const taskSummaries = data
		.map(
			(item) =>
				`• ${
					item.fields?.["System.Title"] || "Tarea sin título"
				} - Estado: ${item.fields?.["System.State"] || "N/A"}`
		)
		.join("\n");

	const prompt = `
Eres un asistente de gestión de proyectos. Resume el estado actual del sprint en base a estas tareas:

${taskSummaries}

Incluye:
- Progreso general (porcentaje estimado)
- Riesgos o bloqueos
- Fechas críticas próximas
- Rendimiento del equipo (si se nota retraso o avance)
`;

	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{
				role: "system",
				content:
					"Eres un experto en gestión de proyectos de software ágil.",
			},
			{ role: "user", content: prompt },
		],
	});

	return completion.choices[0].message.content;
}

async function runSummarizer() {
	console.log("🔄 Generando resumen del sprint...");
	const data = await getProjectData();
	const summary = await summarizeSprint(data);
	console.log("\n📋 RESUMEN DEL SPRINT:\n");
	console.log(summary);

	// futuro: guardar en DB o enviar a Teams/Outlook
}

runSummarizer().catch(console.error);
