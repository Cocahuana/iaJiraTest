const User = require("../../models/user"); // adjust path to your User model
const mongoose = require("mongoose");
const axios = require("axios");

// /d:/0-Trabajos/Personal Projects/iaJiraTest/ia_jira_test_api/controllers/users/user_controller.js

/**
 * Fetch all users of a specific Azure DevOps project.
 *
 * Notes:
 * - Azure DevOps does not expose a single "project users" endpoint. Common approach:
 *   1) List teams in the project:
 *      GET https://dev.azure.com/{organization}/_apis/projects/{projectId}/teams?api-version=6.0
 *   2) For each team, list members:
 *      GET https://dev.azure.com/{organization}/_apis/teams/{teamId}/members?api-version=6.0
 * - Authenticate with a Personal Access Token (PAT) via Basic auth:
 *   Authorization: Basic <base64(':' + PAT)>
 * - You can pass PAT in AZURE_DEVOPS_PAT env var or send it in the request header 'x-azure-pat'.
 */
const getAzureProjectUsers = async (organization, project, pat) => {
	if (!organization || !project)
		throw new Error("organization and project required");
	const token = pat || process.env.AZURE_DEVOPS_PAT;
	if (!token)
		throw new Error(
			"Azure DevOps PAT required (env AZURE_DEVOPS_PAT or pass pat)"
		);

	const authHeader = `Basic ${Buffer.from(":" + token).toString("base64")}`;
	const apiVersion = "6.0";

	// 1) list teams in project
	const teamsUrl = `https://dev.azure.com/${encodeURIComponent(
		organization
	)}/_apis/projects/${encodeURIComponent(
		project
	)}/teams?api-version=${apiVersion}`;
	const teamsResp = await axios.get(teamsUrl, {
		headers: { Authorization: authHeader },
	});
	const teams = (teamsResp.data && teamsResp.data.value) || [];

	// 2) for each team, list members and dedupe
	const usersMap = new Map();
	await Promise.all(
		teams.map(async (team) => {
			const membersUrl = `https://dev.azure.com/${encodeURIComponent(
				organization
			)}/_apis/teams/${encodeURIComponent(
				team.id
			)}/members?api-version=${apiVersion}`;
			const membersResp = await axios.get(membersUrl, {
				headers: { Authorization: authHeader },
			});
			const members = (membersResp.data && membersResp.data.value) || [];
			members.forEach((m) => {
				const key =
					m.descriptor || m.id || m.uniqueName || JSON.stringify(m);
				usersMap.set(key, m);
			});
		})
	);

	return Array.from(usersMap.values());
};

// Express handler you can wire to a route like:
// GET /azure/:organization/projects/:project/users
const getProjectUsersFromAzure = async (req, res) => {
	try {
		const { organization, project } = req.params;
		const pat = req.headers["x-azure-pat"] || process.env.AZURE_DEVOPS_PAT;
		const users = await getAzureProjectUsers(organization, project, pat);
		return res.json(users);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

const getUsers = async (req, res) => {
	try {
		const users = await User.find();
		return res.json(users);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

const getUserById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id))
			return res.status(400).json({ error: "Invalid user id" });

		const user = await User.findById(id);
		if (!user) return res.status(404).json({ error: "User not found" });

		return res.json(user);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

const createUser = async (req, res) => {
	try {
		const payload = req.body;
		const user = new User(payload);
		await user.save();
		return res.status(201).json(user);
	} catch (err) {
		// handle validation errors from mongoose
		return res.status(400).json({ error: err.message });
	}
};

const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id))
			return res.status(400).json({ error: "Invalid user id" });

		const updated = await User.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!updated) return res.status(404).json({ error: "User not found" });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
};

const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id))
			return res.status(400).json({ error: "Invalid user id" });

		const deleted = await User.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ error: "User not found" });

		return res.status(204).send();
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

module.exports = {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
};
