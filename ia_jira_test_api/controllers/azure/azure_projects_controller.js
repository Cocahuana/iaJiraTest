const axios = require("axios");
const { Project, Company } = require("../../db.js");

const AZURE_ORG = process.env.AZURE_ORG;
const AZURE_PAT = process.env.AZURE_PAT;

const authHeader = {
	headers: {
		Authorization: `Basic ${Buffer.from(`:${AZURE_PAT}`).toString(
			"base64"
		)}`,
		Accept: "application/json",
	},
};

async function fetchAzureProjects() {
	const url = `https://dev.azure.com/${AZURE_ORG}/_apis/projects?api-version=7.1-preview.4`;
	const { data } = await axios.get(url, authHeader);
	return data.value;
}

async function syncAzureProjects() {
	const azureProjects = await fetchAzureProjects();

	for (const p of azureProjects) {
		await Project.upsert({
			id: p.id,
			name: p.name,
			state: p.state,
			company_id: null, // se puede asignar más adelante si tenés relación con Company
		});
	}

	return await Project.findAll();
}

module.exports = {
	syncAzureProjects,
};
