const axios = require("axios");
const { User } = require("../../db.js");

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

// 1) Fetch users from Azure DevOps
async function fetchAzureUsers() {
	const url = `https://vssps.dev.azure.com/${AZURE_ORG}/_apis/graph/users?api-version=7.1-preview.1`;
	const { data } = await axios.get(url, authHeader);
	return data.value;
}

// 2) Sync users with Database
async function syncAzureUsers() {
	try {
		const azureUsers = await fetchAzureUsers();
		
		console.log(`Syncing ${azureUsers.length} users from Azure DevOps...`);

		for (const au of azureUsers) {
			// Skip users without email
			if (!au.mailAddress) {
				console.log(`Skipping user without email: ${au.displayName}`);
				continue;
			}

			await User.upsert({
				email: au.mailAddress,
				name: au.displayName || au.principalName || "Unknown User",
				role: "employee", // default role
				auth0_id: null,
			});
		}

		const allUsers = await User.findAll({
			order: [["name", "ASC"]],
		});

		console.log(`Successfully synced ${allUsers.length} users to database`);
		return allUsers;
	} catch (error) {
		console.error("Error syncing Azure users:", error.message);
		throw error;
	}
}

// 3) Get all users from database
async function getAllUsers() {
	try {
		const users = await User.findAll({
			order: [["name", "ASC"]],
		});
		return users;
	} catch (error) {
		console.error("Error fetching users:", error.message);
		throw error;
	}
}

// 4) Get user by ID
async function getUserById(userId) {
	try {
		const user = await User.findByPk(userId);
		if (!user) {
			throw new Error("User not found");
		}
		return user;
	} catch (error) {
		console.error("Error fetching user:", error.message);
		throw error;
	}
}

// 5) Update user role
async function updateUserRole(userId, newRole) {
	try {
		const user = await User.findByPk(userId);
		if (!user) {
			throw new Error("User not found");
		}

		user.role = newRole;
		await user.save();
		
		return user;
	} catch (error) {
		console.error("Error updating user role:", error.message);
		throw error;
	}
}

module.exports = {
	syncAzureUsers,
	getAllUsers,
	getUserById,
	updateUserRole,
	fetchAzureUsers,
};
