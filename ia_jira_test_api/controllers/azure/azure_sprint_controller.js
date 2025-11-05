const axios = require("axios");
const { Project } = require("../../db.js");

const AZURE_ORG = process.env.AZURE_ORG;
const AZURE_PROJECT = process.env.AZURE_PROJECT;
const AZURE_PAT = process.env.AZURE_PAT;

const authHeader = {
	headers: {
		Authorization: `Basic ${Buffer.from(`:${AZURE_PAT}`).toString(
			"base64"
		)}`,
		Accept: "application/json",
	},
};

async function getCurrentSprint() {
	const url = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/work/teamsettings/iterations?$timeframe=current&api-version=7.1-preview.1`;
	const { data } = await axios.get(url, authHeader);
	return data.value[0] || null;
}

module.exports = {
	getCurrentSprint,
};
