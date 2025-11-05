const axios = require("axios");
const { Task, Project, User } = require("../../db.js");

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

async function getAzureTasks() {
	const wiqlUrl = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/wit/wiql?api-version=7.1-preview.2`;
	const query = {
		query: `SELECT [System.Id], [System.Title] FROM WorkItems WHERE [System.TeamProject] = '${AZURE_PROJECT}' ORDER BY [System.CreatedDate] DESC`,
	};
	const wiqlRes = await axios.post(wiqlUrl, query, authHeader);

	const ids = wiqlRes.data.workItems.map((w) => w.id).slice(0, 30);
	if (ids.length === 0) return [];

	const workItemsUrl = `https://dev.azure.com/${AZURE_ORG}/_apis/wit/workitems?ids=${ids.join(
		","
	)}&api-version=7.1-preview.3`;
	const details = await axios.get(workItemsUrl, authHeader);

	// guardar o actualizar en DB
	for (const item of details.data.value) {
		await Task.upsert(
			{
				azure_id: item.id,
				title: item.fields["System.Title"],
				status: item.fields["System.State"] || "New",
				priority: item.fields["Microsoft.VSTS.Common.Priority"] || null,
				description: item.fields["System.Description"] || null,
				project_id: null, // asignar después con syncProject o lookup
				assignee_id: null, // si tenés un mapeo entre azure y tus usuarios
			},
			{
				conflictFields: ["azure_id"],
			}
		);
	}

	// Get saved tasks from database with proper structure
	const savedTasks = await Task.findAll({
		where: {
			azure_id: ids,
		},
		include: [
			{
				model: User,
				attributes: ["id", "name", "email"],
				required: false,
			},
			{
				model: Project,
				attributes: ["id", "name"],
				required: false,
			},
		],
	});

	// Return tasks with both Azure data and database relationships
	return details.data.value.map((item) => {
		const dbTask = savedTasks.find((t) => t.azure_id === item.id);
		
		return {
			id: item.id,
			azure_id: item.id,
			title: item.fields["System.Title"],
			status: item.fields["System.State"], // Use 'status' not 'state'
			state: item.fields["System.State"], // Keep for compatibility
			priority: item.fields["Microsoft.VSTS.Common.Priority"] || null,
			description: item.fields["System.Description"] || null,
			assignedTo: item.fields["System.AssignedTo"]?.displayName || "Unassigned",
			assignee_id: dbTask?.assignee_id || null,
			User: dbTask?.User || null,
			project_id: dbTask?.project_id || null,
			Project: dbTask?.Project || null,
			due_date: dbTask?.due_date || null,
		};
	});
}

module.exports = {
	getAzureTasks,
};
