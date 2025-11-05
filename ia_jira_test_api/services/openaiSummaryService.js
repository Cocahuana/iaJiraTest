// /services/openaiSummaryService.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera un resumen automático basado en logs, métricas o tareas.
 * @param {string} title - Nombre del proceso o tarea
 * @param {Array|string} data - Logs o texto de entrada
 */
async function generateSummary(title, data) {
	try {
		const text = Array.isArray(data) ? data.join("\n") : data;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"Eres un analista técnico que resume logs de sistemas para managers ocupados. Menciona errores, estados y conclusiones relevantes.",
				},
				{
					role: "user",
					content: `Título: ${title}\n\nDatos:\n${text}\n\nGenera un resumen breve, profesional y con recomendaciones si aplica.`,
				},
			],
			temperature: 0.3,
		});

		return completion.choices[0].message.content.trim();
	} catch (error) {
		console.error("❌ Error generando resumen con OpenAI:", error.message);
		return "No se pudo generar el resumen.";
	}
}

module.exports = { generateSummary };
