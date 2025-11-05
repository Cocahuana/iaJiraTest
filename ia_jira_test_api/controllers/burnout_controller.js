// controllers/burnout_controller.js
const { BurnoutMetric, User, Team, TimeEntry, Task } = require("../db.js");
const { Op } = require("sequelize");

// Calculate burnout score based on various factors
function calculateBurnoutScore(data) {
	let score = 0;

	// Factor 1: Overtime hours (0-40 points)
	if (data.overtime_hours > 20) score += 40;
	else if (data.overtime_hours > 10) score += 30;
	else if (data.overtime_hours > 5) score += 20;
	else if (data.overtime_hours > 0) score += 10;

	// Factor 2: Overdue tasks (0-30 points)
	if (data.tasks_overdue > 10) score += 30;
	else if (data.tasks_overdue > 5) score += 20;
	else if (data.tasks_overdue > 2) score += 10;

	// Factor 3: Weekly hours worked (0-30 points)
	if (data.hours_worked > 60) score += 30;
	else if (data.hours_worked > 50) score += 20;
	else if (data.hours_worked > 45) score += 10;

	// Determine stress level
	let stress_level = "low";
	if (score >= 70) stress_level = "critical";
	else if (score >= 50) stress_level = "high";
	else if (score >= 30) stress_level = "medium";

	return { score, stress_level };
}

// Get all burnout metrics
async function getAllBurnoutMetrics(req, res) {
	try {
		const metrics = await BurnoutMetric.findAll({
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Team,
					attributes: ["id", "name"],
					required: false,
				},
			],
			order: [["date", "DESC"]],
		});
		res.json({ success: true, metrics });
	} catch (error) {
		console.error("Error fetching burnout metrics:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get burnout metrics by user
async function getBurnoutMetricsByUser(req, res) {
	try {
		const { userId } = req.params;
		const { days = 30 } = req.query;

		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

		const metrics = await BurnoutMetric.findAll({
			where: {
				user_id: userId,
				date: {
					[Op.gte]: dateThreshold,
				},
			},
			order: [["date", "DESC"]],
		});

		// Calculate average burnout score
		const avgScore =
			metrics.reduce(
				(sum, m) => sum + parseFloat(m.burnout_score),
				0
			) / (metrics.length || 1);

		res.json({ success: true, metrics, avgScore: avgScore.toFixed(2) });
	} catch (error) {
		console.error("Error fetching user burnout metrics:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get burnout metrics by team
async function getBurnoutMetricsByTeam(req, res) {
	try {
		const { teamId } = req.params;
		const { days = 30 } = req.query;

		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

		const metrics = await BurnoutMetric.findAll({
			where: {
				team_id: teamId,
				date: {
					[Op.gte]: dateThreshold,
				},
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["date", "DESC"]],
		});

		// Calculate team average
		const avgScore =
			metrics.reduce(
				(sum, m) => sum + parseFloat(m.burnout_score),
				0
			) / (metrics.length || 1);

		// Get high-risk members (score > 70)
		const highRiskMembers = metrics.filter(
			(m) => parseFloat(m.burnout_score) >= 70
		);

		res.json({
			success: true,
			metrics,
			avgScore: avgScore.toFixed(2),
			highRiskCount: highRiskMembers.length,
		});
	} catch (error) {
		console.error("Error fetching team burnout metrics:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get high-risk users (burnout score > 70)
async function getHighRiskUsers(req, res) {
	try {
		const { days = 7 } = req.query;

		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

		const metrics = await BurnoutMetric.findAll({
			where: {
				date: {
					[Op.gte]: dateThreshold,
				},
				burnout_score: {
					[Op.gte]: 70,
				},
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["burnout_score", "DESC"]],
		});

		res.json({ success: true, highRiskUsers: metrics });
	} catch (error) {
		console.error("Error fetching high-risk users:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create burnout metric
async function createBurnoutMetric(req, res) {
	try {
		const {
			user_id,
			team_id,
			date,
			hours_worked,
			overtime_hours,
			tasks_completed,
			tasks_overdue,
			notes,
		} = req.body;

		// Calculate burnout score
		const { score, stress_level } = calculateBurnoutScore({
			hours_worked,
			overtime_hours,
			tasks_overdue,
		});

		const metric = await BurnoutMetric.create({
			user_id,
			team_id,
			date,
			hours_worked,
			overtime_hours,
			tasks_completed,
			tasks_overdue,
			burnout_score: score,
			stress_level,
			notes,
		});

		const metricWithDetails = await BurnoutMetric.findByPk(metric.id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Team,
					attributes: ["id", "name"],
					required: false,
				},
			],
		});

		res.json({ success: true, metric: metricWithDetails });
	} catch (error) {
		console.error("Error creating burnout metric:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Auto-calculate burnout metrics for a user based on time entries
async function autoCalculateBurnout(req, res) {
	try {
		const { userId } = req.params;
		const { startDate, endDate } = req.query;

		// Get time entries for the period
		const timeEntries = await TimeEntry.findAll({
			where: {
				user_id: userId,
				date: {
					[Op.between]: [new Date(startDate), new Date(endDate)],
				},
			},
		});

		// Calculate weekly hours
		const totalHours = timeEntries.reduce(
			(sum, entry) => sum + parseFloat(entry.hours),
			0
		);
		const overtimeHours = totalHours > 40 ? totalHours - 40 : 0;

		// Get tasks data (you might want to adjust this based on your task model)
		const tasks = await Task.findAll({
			where: {
				assignee_id: userId,
			},
		});

		const tasksCompleted = tasks.filter(
			(t) => t.status === "completed"
		).length;
		const tasksOverdue = tasks.filter(
			(t) => t.due_date < new Date() && t.status !== "completed"
		).length;

		// Calculate burnout score
		const { score, stress_level } = calculateBurnoutScore({
			hours_worked: totalHours,
			overtime_hours: overtimeHours,
			tasks_overdue: tasksOverdue,
		});

		// Create or update metric
		const metric = await BurnoutMetric.create({
			user_id: userId,
			date: new Date(endDate),
			hours_worked: totalHours,
			overtime_hours: overtimeHours,
			tasks_completed: tasksCompleted,
			tasks_overdue: tasksOverdue,
			burnout_score: score,
			stress_level,
		});

		const metricWithDetails = await BurnoutMetric.findByPk(metric.id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		res.json({ success: true, metric: metricWithDetails });
	} catch (error) {
		console.error("Error auto-calculating burnout:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update burnout metric
async function updateBurnoutMetric(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const metric = await BurnoutMetric.findByPk(id);
		if (!metric) {
			return res
				.status(404)
				.json({ success: false, error: "Burnout metric not found" });
		}

		// Recalculate score if relevant fields changed
		if (
			updates.hours_worked ||
			updates.overtime_hours ||
			updates.tasks_overdue
		) {
			const { score, stress_level } = calculateBurnoutScore({
				hours_worked: updates.hours_worked || metric.hours_worked,
				overtime_hours:
					updates.overtime_hours || metric.overtime_hours,
				tasks_overdue: updates.tasks_overdue || metric.tasks_overdue,
			});
			updates.burnout_score = score;
			updates.stress_level = stress_level;
		}

		await metric.update(updates);

		const updatedMetric = await BurnoutMetric.findByPk(id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Team,
					attributes: ["id", "name"],
					required: false,
				},
			],
		});

		res.json({ success: true, metric: updatedMetric });
	} catch (error) {
		console.error("Error updating burnout metric:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	getAllBurnoutMetrics,
	getBurnoutMetricsByUser,
	getBurnoutMetricsByTeam,
	getHighRiskUsers,
	createBurnoutMetric,
	autoCalculateBurnout,
	updateBurnoutMetric,
	calculateBurnoutScore,
};

