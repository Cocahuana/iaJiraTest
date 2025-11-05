// src/openaiService.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeTaskOutput(taskName, logs) {
	const joinedLogs = logs.join("\n");

	const response = await client.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{
				role: "system",
				content: `Eres un asistente que analiza resultados de tareas automatizadas y genera resúmenes útiles para reportes.`,
			},
			{
				role: "user",
				content: `
Tarea: ${taskName}
Logs:
${joinedLogs}

Genera un resumen claro, menciona errores si los hay y concluye con el estado general.`,
			},
		],
	});

	return response.choices[0].message.content.trim();
}
