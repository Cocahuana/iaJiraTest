// scripts/testEndpoints.js
// Quick script to test if all API endpoints are working

const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001";

const endpoints = [
	{ method: "GET", path: "/api/vacations", description: "Get all vacations" },
	{
		method: "GET",
		path: "/api/vacations/upcoming",
		description: "Get upcoming vacations",
	},
	{
		method: "GET",
		path: "/api/vacations/current",
		description: "Get current vacations",
	},
	{ method: "GET", path: "/api/sprints", description: "Get all sprints" },
	{
		method: "GET",
		path: "/api/sprints/active",
		description: "Get active sprints",
	},
	{
		method: "GET",
		path: "/api/sprints/ending-soon",
		description: "Get sprints ending soon",
	},
	{
		method: "GET",
		path: "/api/budget/costs",
		description: "Get all sprint costs",
	},
	{
		method: "GET",
		path: "/api/budget/overruns",
		description: "Get budget overruns",
	},
	{
		method: "GET",
		path: "/api/timeentries/unbilled",
		description: "Get unbilled time entries",
	},
	{
		method: "GET",
		path: "/api/timeentries/unapproved",
		description: "Get unapproved time entries",
	},
	{
		method: "GET",
		path: "/api/timeentries/missing",
		description: "Get missing time entries",
	},
	{
		method: "GET",
		path: "/api/burnout/high-risk",
		description: "Get high-risk burnout users",
	},
	{
		method: "GET",
		path: "/api/azure/users/sync",
		description: "Sync Azure DevOps users",
	},
	{
		method: "GET",
		path: "/api/azure/projects/sync",
		description: "Sync Azure DevOps projects",
	},
	{
		method: "GET",
		path: "/api/azure/tasks",
		description: "Get Azure DevOps tasks",
	},
];

async function testEndpoint(endpoint) {
	try {
		const response = await axios({
			method: endpoint.method,
			url: `${API_URL}${endpoint.path}`,
			timeout: 10000,
		});

		console.log(`✅ ${endpoint.method} ${endpoint.path}`);
		console.log(`   ${endpoint.description}`);
		console.log(`   Status: ${response.status}`);

		// Show data count if it's an array
		if (Array.isArray(response.data)) {
			console.log(`   Results: ${response.data.length} items`);
		} else if (
			response.data.success !== undefined &&
			response.data.success === true
		) {
			console.log(`   Success: true`);
			// Count items in common response structures
			const keys = Object.keys(response.data).filter(
				(k) => Array.isArray(response.data[k])
			);
			if (keys.length > 0) {
				keys.forEach((key) => {
					console.log(`   ${key}: ${response.data[key].length} items`);
				});
			}
		}
		console.log("");
		return true;
	} catch (error) {
		console.log(`❌ ${endpoint.method} ${endpoint.path}`);
		console.log(`   ${endpoint.description}`);
		if (error.response) {
			console.log(`   Status: ${error.response.status}`);
			console.log(`   Error: ${error.response.statusText}`);
		} else if (error.code === "ECONNREFUSED") {
			console.log(`   Error: Cannot connect to server at ${API_URL}`);
			console.log(`   Make sure the server is running!`);
		} else {
			console.log(`   Error: ${error.message}`);
		}
		console.log("");
		return false;
	}
}

async function runTests() {
	console.log("🚀 Testing PM Management System API Endpoints");
	console.log(`📍 API URL: ${API_URL}\n`);
	console.log("=" .repeat(60));
	console.log("");

	let passed = 0;
	let failed = 0;

	for (const endpoint of endpoints) {
		const result = await testEndpoint(endpoint);
		if (result) {
			passed++;
		} else {
			failed++;
		}
		// Small delay between requests
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	console.log("=" .repeat(60));
	console.log("\n📊 Test Results:");
	console.log(`   ✅ Passed: ${passed}`);
	console.log(`   ❌ Failed: ${failed}`);
	console.log(`   📈 Total: ${endpoints.length}`);
	console.log(`   🎯 Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);

	if (failed === 0) {
		console.log("\n🎉 All endpoints are working correctly!");
	} else if (failed === endpoints.length) {
		console.log(
			"\n⚠️  No endpoints are working. Check if the server is running!"
		);
	} else {
		console.log(
			"\n⚠️  Some endpoints failed. Check the errors above for details."
		);
	}
}

runTests();

