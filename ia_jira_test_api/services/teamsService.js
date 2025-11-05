// services/teamsService.js
const axios = require("axios");

/**
 * Send message to Microsoft Teams using webhook
 * To use this, you need to configure an Incoming Webhook in your Teams channel
 * Docs: https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook
 */
async function sendTeamsMessage({ webhookUrl, title, message, color, facts }) {
	try {
		const card = {
			"@type": "MessageCard",
			"@context": "https://schema.org/extensions",
			summary: title,
			themeColor: color || "0078D4",
			title: title,
			sections: [
				{
					activityTitle: message,
					facts: facts || [],
				},
			],
		};

		const response = await axios.post(webhookUrl, card);

		console.log("Teams message sent successfully");
		return { success: true, response: response.data };
	} catch (error) {
		console.error("Error sending Teams message:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Alternative: Send message using Microsoft Graph API
 * This requires OAuth authentication with Microsoft Graph
 */
async function sendTeamsMessageViaGraph({
	accessToken,
	teamId,
	channelId,
	message,
}) {
	try {
		const url = `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`;

		const response = await axios.post(
			url,
			{
				body: {
					content: message,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		console.log("Teams message sent via Graph API");
		return { success: true, response: response.data };
	} catch (error) {
		console.error("Error sending Teams message via Graph:", error);
		return { success: false, error: error.message };
	}
}

// Send budget overrun alert to Teams
async function sendBudgetOverrunTeamsAlert({
	webhookUrl,
	projectName,
	sprintName,
	amount,
}) {
	return await sendTeamsMessage({
		webhookUrl,
		title: "⚠️ Budget Overrun Alert",
		message: `The sprint ${sprintName} in project ${projectName} has exceeded its budget.`,
		color: "DC3545",
		facts: [
			{ name: "Project", value: projectName },
			{ name: "Sprint", value: sprintName },
			{ name: "Overrun Amount", value: `$${amount}` },
			{ name: "Action Required", value: "Review sprint costs" },
		],
	});
}

// Send sprint ending reminder to Teams
async function sendSprintEndingTeamsReminder({
	webhookUrl,
	projectName,
	sprintName,
	daysLeft,
}) {
	return await sendTeamsMessage({
		webhookUrl,
		title: "📅 Sprint Ending Soon",
		message: `Sprint ${sprintName} in project ${projectName} is ending soon.`,
		color: "0D6EFD",
		facts: [
			{ name: "Project", value: projectName },
			{ name: "Sprint", value: sprintName },
			{ name: "Days Left", value: daysLeft.toString() },
			{ name: "Action Required", value: "Prepare for sprint review" },
		],
	});
}

// Send burnout alert to Teams
async function sendBurnoutTeamsAlert({
	webhookUrl,
	employeeName,
	burnoutScore,
	stressLevel,
}) {
	return await sendTeamsMessage({
		webhookUrl,
		title: "🔥 Burnout Alert",
		message: `Employee ${employeeName} has a high burnout score.`,
		color: "DC3545",
		facts: [
			{ name: "Employee", value: employeeName },
			{ name: "Burnout Score", value: `${burnoutScore}/100` },
			{ name: "Stress Level", value: stressLevel },
			{ name: "Action Required", value: "Check in with team member" },
		],
	});
}

// Send vacation reminder to Teams
async function sendVacationTeamsReminder({
	webhookUrl,
	employeeName,
	startDate,
	endDate,
}) {
	return await sendTeamsMessage({
		webhookUrl,
		title: "🏖️ Upcoming Vacation",
		message: `${employeeName} will be on vacation soon.`,
		color: "0D6EFD",
		facts: [
			{ name: "Employee", value: employeeName },
			{ name: "Start Date", value: new Date(startDate).toLocaleDateString() },
			{ name: "End Date", value: new Date(endDate).toLocaleDateString() },
			{ name: "Action Required", value: "Plan task coverage" },
		],
	});
}

// Send time entry missing reminder to Teams
async function sendTimeEntryMissingTeamsReminder({
	webhookUrl,
	employeeName,
	days,
}) {
	return await sendTeamsMessage({
		webhookUrl,
		title: "⏰ Time Entry Missing",
		message: `${employeeName} has not logged time entries recently.`,
		color: "FFC107",
		facts: [
			{ name: "Employee", value: employeeName },
			{ name: "Days Without Entries", value: days.toString() },
			{ name: "Action Required", value: "Remind to log hours" },
		],
	});
}

module.exports = {
	sendTeamsMessage,
	sendTeamsMessageViaGraph,
	sendBudgetOverrunTeamsAlert,
	sendSprintEndingTeamsReminder,
	sendBurnoutTeamsAlert,
	sendVacationTeamsReminder,
	sendTimeEntryMissingTeamsReminder,
};

