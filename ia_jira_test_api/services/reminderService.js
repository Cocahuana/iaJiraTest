// services/reminderService.js
const {
	Notification,
	Sprint,
	SprintCost,
	User,
	Project,
	Vacation,
	TimeEntry,
	BurnoutMetric,
} = require("../db.js");
const { Op } = require("sequelize");
const emailService = require("./emailService");
const teamsService = require("./teamsService");

// Get all PMs
async function getAllPMs() {
	return await User.findAll({
		where: {
			role: "pm",
		},
	});
}

// Check for budget overruns and send notifications
async function checkBudgetOverruns() {
	console.log("🔍 Checking for budget overruns...");

	try {
		const overruns = await SprintCost.findAll({
			where: {
				overrun_amount: {
					[Op.gt]: 0,
				},
			},
			include: [
				{
					model: Sprint,
					include: [
						{
							model: Project,
						},
					],
				},
				{
					model: User,
				},
			],
		});

		const pms = await getAllPMs();

		for (const overrun of overruns) {
			const sprint = overrun.Sprint;
			const project = sprint.Project;

			// Create notification
			for (const pm of pms) {
				await Notification.create({
					user_id: pm.id,
					project_id: project.id,
					type: "budget_overrun",
					title: `Budget Overrun: ${project.name} - ${sprint.name}`,
					message: `Sprint has exceeded budget by $${overrun.overrun_amount}`,
					priority: "high",
					metadata: {
						sprint_id: sprint.id,
						overrun_amount: overrun.overrun_amount,
					},
				});

				// Send email
				if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
					await emailService.sendBudgetOverrunAlert({
						to: pm.email,
						projectName: project.name,
						sprintName: sprint.name,
						amount: overrun.overrun_amount,
					});
				}

				// Send Teams notification
				if (
					process.env.TEAMS_NOTIFICATIONS_ENABLED === "true" &&
					process.env.TEAMS_WEBHOOK_URL
				) {
					await teamsService.sendBudgetOverrunTeamsAlert({
						webhookUrl: process.env.TEAMS_WEBHOOK_URL,
						projectName: project.name,
						sprintName: sprint.name,
						amount: overrun.overrun_amount,
					});
				}
			}
		}

		console.log(`✅ Checked ${overruns.length} budget overruns`);
	} catch (error) {
		console.error("Error checking budget overruns:", error);
	}
}

// Check for sprints ending soon
async function checkSprintsEndingSoon() {
	console.log("🔍 Checking for sprints ending soon...");

	try {
		const today = new Date();
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(today.getDate() + 7);

		const sprints = await Sprint.findAll({
			where: {
				end_date: {
					[Op.between]: [today, sevenDaysFromNow],
				},
				status: "active",
			},
			include: [
				{
					model: Project,
				},
			],
		});

		const pms = await getAllPMs();

		for (const sprint of sprints) {
			const project = sprint.Project;
			const daysLeft = Math.ceil(
				(new Date(sprint.end_date) - today) / (1000 * 60 * 60 * 24)
			);

			for (const pm of pms) {
				await Notification.create({
					user_id: pm.id,
					project_id: project.id,
					type: "sprint_ending",
					title: `Sprint Ending Soon: ${project.name} - ${sprint.name}`,
					message: `Sprint ends in ${daysLeft} days`,
					priority: "medium",
					metadata: {
						sprint_id: sprint.id,
						days_left: daysLeft,
						end_date: sprint.end_date,
					},
				});

				// Send email
				if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
					await emailService.sendSprintEndingReminder({
						to: pm.email,
						projectName: project.name,
						sprintName: sprint.name,
						daysLeft,
					});
				}

				// Send Teams notification
				if (
					process.env.TEAMS_NOTIFICATIONS_ENABLED === "true" &&
					process.env.TEAMS_WEBHOOK_URL
				) {
					await teamsService.sendSprintEndingTeamsReminder({
						webhookUrl: process.env.TEAMS_WEBHOOK_URL,
						projectName: project.name,
						sprintName: sprint.name,
						daysLeft,
					});
				}
			}
		}

		console.log(`✅ Checked ${sprints.length} sprints ending soon`);
	} catch (error) {
		console.error("Error checking sprints ending soon:", error);
	}
}

// Check for high burnout scores
async function checkBurnoutAlerts() {
	console.log("🔍 Checking for burnout alerts...");

	try {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const highRiskMetrics = await BurnoutMetric.findAll({
			where: {
				date: {
					[Op.gte]: sevenDaysAgo,
				},
				burnout_score: {
					[Op.gte]: 70,
				},
			},
			include: [
				{
					model: User,
				},
			],
		});

		const pms = await getAllPMs();

		for (const metric of highRiskMetrics) {
			const user = metric.User;

			for (const pm of pms) {
				await Notification.create({
					user_id: pm.id,
					type: "burnout_alert",
					title: `Burnout Alert: ${user.name}`,
					message: `${user.name} has a high burnout score of ${metric.burnout_score}/100`,
					priority: "critical",
					metadata: {
						employee_id: user.id,
						burnout_score: metric.burnout_score,
						stress_level: metric.stress_level,
					},
				});

				// Send email
				if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
					await emailService.sendBurnoutAlert({
						to: pm.email,
						employeeName: user.name,
						burnoutScore: metric.burnout_score,
						stressLevel: metric.stress_level,
					});
				}

				// Send Teams notification
				if (
					process.env.TEAMS_NOTIFICATIONS_ENABLED === "true" &&
					process.env.TEAMS_WEBHOOK_URL
				) {
					await teamsService.sendBurnoutTeamsAlert({
						webhookUrl: process.env.TEAMS_WEBHOOK_URL,
						employeeName: user.name,
						burnoutScore: metric.burnout_score,
						stressLevel: metric.stress_level,
					});
				}
			}
		}

		console.log(`✅ Checked ${highRiskMetrics.length} burnout alerts`);
	} catch (error) {
		console.error("Error checking burnout alerts:", error);
	}
}

// Check for upcoming vacations
async function checkUpcomingVacations() {
	console.log("🔍 Checking for upcoming vacations...");

	try {
		const today = new Date();
		const threeDaysFromNow = new Date();
		threeDaysFromNow.setDate(today.getDate() + 3);

		const vacations = await Vacation.findAll({
			where: {
				start_date: {
					[Op.between]: [today, threeDaysFromNow],
				},
				status: "approved",
			},
			include: [
				{
					model: User,
				},
			],
		});

		const pms = await getAllPMs();

		for (const vacation of vacations) {
			const user = vacation.User;

			for (const pm of pms) {
				await Notification.create({
					user_id: pm.id,
					type: "vacation_reminder",
					title: `Upcoming Vacation: ${user.name}`,
					message: `${user.name} will be on vacation from ${new Date(
						vacation.start_date
					).toLocaleDateString()} to ${new Date(
						vacation.end_date
					).toLocaleDateString()}`,
					priority: "medium",
					metadata: {
						employee_id: user.id,
						start_date: vacation.start_date,
						end_date: vacation.end_date,
					},
				});

				// Send email
				if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
					await emailService.sendVacationReminder({
						to: pm.email,
						employeeName: user.name,
						startDate: vacation.start_date,
						endDate: vacation.end_date,
					});
				}

				// Send Teams notification
				if (
					process.env.TEAMS_NOTIFICATIONS_ENABLED === "true" &&
					process.env.TEAMS_WEBHOOK_URL
				) {
					await teamsService.sendVacationTeamsReminder({
						webhookUrl: process.env.TEAMS_WEBHOOK_URL,
						employeeName: user.name,
						startDate: vacation.start_date,
						endDate: vacation.end_date,
					});
				}
			}
		}

		console.log(`✅ Checked ${vacations.length} upcoming vacations`);
	} catch (error) {
		console.error("Error checking upcoming vacations:", error);
	}
}

// Check for missing time entries
async function checkMissingTimeEntries() {
	console.log("🔍 Checking for missing time entries...");

	try {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Get all active users
		const allUsers = await User.findAll({
			where: {
				role: { [Op.ne]: "admin" },
			},
		});

		// Get users who have logged time recently
		const usersWithEntries = await TimeEntry.findAll({
			where: {
				date: {
					[Op.gte]: sevenDaysAgo,
				},
			},
			attributes: ["user_id"],
			group: ["user_id"],
		});

		const usersWithEntriesIds = usersWithEntries.map((e) => e.user_id);

		// Find users who haven't logged time
		const usersWithoutEntries = allUsers.filter(
			(user) => !usersWithEntriesIds.includes(user.id)
		);

		const pms = await getAllPMs();

		for (const user of usersWithoutEntries) {
			for (const pm of pms) {
				await Notification.create({
					user_id: pm.id,
					type: "time_entry_missing",
					title: `Missing Time Entries: ${user.name}`,
					message: `${user.name} has not logged any time entries in the past 7 days`,
					priority: "medium",
					metadata: {
						employee_id: user.id,
						days: 7,
					},
				});

				// Send email
				if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "true") {
					await emailService.sendTimeEntryMissingReminder({
						to: pm.email,
						employeeName: user.name,
						days: 7,
					});
				}

				// Send Teams notification
				if (
					process.env.TEAMS_NOTIFICATIONS_ENABLED === "true" &&
					process.env.TEAMS_WEBHOOK_URL
				) {
					await teamsService.sendTimeEntryMissingTeamsReminder({
						webhookUrl: process.env.TEAMS_WEBHOOK_URL,
						employeeName: user.name,
						days: 7,
					});
				}
			}
		}

		console.log(
			`✅ Found ${usersWithoutEntries.length} users with missing time entries`
		);
	} catch (error) {
		console.error("Error checking missing time entries:", error);
	}
}

// Run all checks
async function runAllChecks() {
	console.log("🚀 Running all reminder checks...");

	await checkBudgetOverruns();
	await checkSprintsEndingSoon();
	await checkBurnoutAlerts();
	await checkUpcomingVacations();
	await checkMissingTimeEntries();

	console.log("✅ All checks completed");
}

module.exports = {
	checkBudgetOverruns,
	checkSprintsEndingSoon,
	checkBurnoutAlerts,
	checkUpcomingVacations,
	checkMissingTimeEntries,
	runAllChecks,
};

