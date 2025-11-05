// controllers/timeentry_controller.js
const { TimeEntry, User, Project, Task } = require("../db.js");
const { Op } = require("sequelize");

// Get all time entries
async function getAllTimeEntries(req, res) {
	try {
		const entries = await TimeEntry.findAll({
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
			order: [["date", "DESC"]],
		});
		res.json({ success: true, entries });
	} catch (error) {
		console.error("Error fetching time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get time entries by user
async function getTimeEntriesByUser(req, res) {
	try {
		const { userId } = req.params;
		const entries = await TimeEntry.findAll({
			where: { user_id: userId },
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
			order: [["date", "DESC"]],
		});
		res.json({ success: true, entries });
	} catch (error) {
		console.error("Error fetching user time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get time entries by project
async function getTimeEntriesByProject(req, res) {
	try {
		const { projectId } = req.params;
		const entries = await TimeEntry.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
			order: [["date", "DESC"]],
		});
		res.json({ success: true, entries });
	} catch (error) {
		console.error("Error fetching project time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get unbilled time entries
async function getUnbilledTimeEntries(req, res) {
	try {
		const entries = await TimeEntry.findAll({
			where: {
				billable: true,
				billed: false,
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
			order: [["date", "ASC"]],
		});

		const totalHours = entries.reduce(
			(sum, entry) => sum + parseFloat(entry.hours),
			0
		);

		res.json({ success: true, entries, totalHours });
	} catch (error) {
		console.error("Error fetching unbilled time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get unapproved time entries
async function getUnapprovedTimeEntries(req, res) {
	try {
		const entries = await TimeEntry.findAll({
			where: {
				approved: false,
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
			order: [["date", "DESC"]],
		});
		res.json({ success: true, entries });
	} catch (error) {
		console.error("Error fetching unapproved time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get missing time entries (users who haven't logged time recently)
async function getMissingTimeEntries(req, res) {
	try {
		const { days = 7 } = req.query;
		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

		// Get all active users
		const allUsers = await User.findAll({
			where: { role: { [Op.ne]: "admin" } },
			attributes: ["id", "name", "email"],
		});

		// Get users who have logged time recently
		const usersWithEntries = await TimeEntry.findAll({
			where: {
				date: {
					[Op.gte]: dateThreshold,
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

		res.json({
			success: true,
			missingUsers: usersWithoutEntries,
			daysChecked: days,
		});
	} catch (error) {
		console.error("Error fetching missing time entries:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create time entry
async function createTimeEntry(req, res) {
	try {
		const {
			user_id,
			project_id,
			task_id,
			date,
			hours,
			description,
			billable,
		} = req.body;

		const entry = await TimeEntry.create({
			user_id,
			project_id,
			task_id,
			date,
			hours,
			description,
			billable,
		});

		const entryWithDetails = await TimeEntry.findByPk(entry.id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
		});

		res.json({ success: true, entry: entryWithDetails });
	} catch (error) {
		console.error("Error creating time entry:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update time entry
async function updateTimeEntry(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const entry = await TimeEntry.findByPk(id);
		if (!entry) {
			return res
				.status(404)
				.json({ success: false, error: "Time entry not found" });
		}

		await entry.update(updates);

		const updatedEntry = await TimeEntry.findByPk(id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
		});

		res.json({ success: true, entry: updatedEntry });
	} catch (error) {
		console.error("Error updating time entry:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Approve time entry
async function approveTimeEntry(req, res) {
	try {
		const { id } = req.params;
		const { approver_id } = req.body;

		const entry = await TimeEntry.findByPk(id);
		if (!entry) {
			return res
				.status(404)
				.json({ success: false, error: "Time entry not found" });
		}

		await entry.update({
			approved: true,
			approved_by: approver_id,
			approved_at: new Date(),
		});

		const updatedEntry = await TimeEntry.findByPk(id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
		});

		res.json({ success: true, entry: updatedEntry });
	} catch (error) {
		console.error("Error approving time entry:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Mark time entry as billed
async function markTimeEntryBilled(req, res) {
	try {
		const { id } = req.params;

		const entry = await TimeEntry.findByPk(id);
		if (!entry) {
			return res
				.status(404)
				.json({ success: false, error: "Time entry not found" });
		}

		await entry.update({ billed: true });

		const updatedEntry = await TimeEntry.findByPk(id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: Task,
					attributes: ["id", "title"],
				},
			],
		});

		res.json({ success: true, entry: updatedEntry });
	} catch (error) {
		console.error("Error marking time entry as billed:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	getAllTimeEntries,
	getTimeEntriesByUser,
	getTimeEntriesByProject,
	getUnbilledTimeEntries,
	getUnapprovedTimeEntries,
	getMissingTimeEntries,
	createTimeEntry,
	updateTimeEntry,
	approveTimeEntry,
	markTimeEntryBilled,
};

