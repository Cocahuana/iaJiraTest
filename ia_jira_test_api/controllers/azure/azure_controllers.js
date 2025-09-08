const axios = require("axios");

const AZURE_ORG = process.env.AZURE_ORG;
const AZURE_PROJECT = process.env.AZURE_PROJECT;
const AZURE_PAT = process.env.AZURE_PAT;

// Base64 token auth
const authHeader = {
	headers: {
		Authorization: `Basic ${Buffer.from(`:${AZURE_PAT}`).toString(
			"base64"
		)}`,
		Accept: "application/json",
	},
};

async function getAzureBacklog() {
	const url = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/wit/wiql?api-version=7.1-preview.2`;
	const query = {
		query: `SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.TeamProject] = '${AZURE_PROJECT}' ORDER BY [System.ChangedDate] DESC`,
	};
	const response = await axios.post(url, query, authHeader);

	const ids = response.data.workItems.map((w) => w.id).slice(0, 20); // limitar resultados

	if (ids.length === 0) return [];

	const workItemsUrl = `https://dev.azure.com/${AZURE_ORG}/_apis/wit/workitems?ids=${ids.join(
		","
	)}&api-version=7.1-preview.3`;
	const details = await axios.get(workItemsUrl, authHeader);

	return details.data.value.map((item) => ({
		id: item.id,
		title: item.fields["System.Title"],
		state: item.fields["System.State"],
		assignedTo:
			item.fields["System.AssignedTo"]?.displayName || "Sin asignar",
		priority: item.fields["Microsoft.VSTS.Common.Priority"] || null,
	}));
}

async function getAzureSprints() {
	const url = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/work/teamsettings/iterations?api-version=7.1-preview.1`;
	const response = await axios.get(url, authHeader);
	return response.data.value;
}

module.exports = {
	getAzureBacklog,
	getAzureSprints,
};
