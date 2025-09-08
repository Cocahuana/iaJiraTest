// const { Configuration, OpenAIApi } = require("openai");

// const configuration = new Configuration({
// 	apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// async function prioritizeWithAI(issues) {
// 	const prompt = `Prioriza estas tareas de desarrollo de software:\n\n${issues
// 		.map((i) => `- ${i.summary}`)
// 		.join(
// 			"\n"
// 		)}\n\nDevuelve una lista ordenada por prioridad (1=urgente) en formato JSON:`;

// 	const response = await openai.createCompletion({
// 		model: "text-davinci-003",
// 		prompt,
// 		max_tokens: 1000,
// 		temperature: 0.7,
// 	});

// 	return JSON.parse(response.data.choices[0].text);
// }

import OpenAI from "openai";

// Configuración segura (usa variables de entorno)
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // Mueve tu clave a .env
});

async function testOpenAI() {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo", // Modelo actual
			messages: [
				{
					role: "user",
					content: "Escribe un haiku sobre IA",
				},
			],
			max_tokens: 100,
		});

		console.log(response.choices[0].message.content);
	} catch (error) {
		console.error("Error:", error);
	}
}

// testOpenAI();
