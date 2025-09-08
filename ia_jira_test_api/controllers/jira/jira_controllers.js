const { Version3Client } = require("jira.js");

const client = new Version3Client({
	host: `https://${process.env.JIRA_DOMAIN}`,
	authentication: {
		basic: {
			email: process.env.JIRA_USER,
			apiToken: process.env.JIRA_TOKEN,
		},
	},
});

async function getBacklogIssues() {
	const issues = await client.issueSearch.searchForIssuesUsingJql({
		jql: 'project = YOUR_PROJECT AND status = "Backlog"',
	});
	return issues.issues;
}
