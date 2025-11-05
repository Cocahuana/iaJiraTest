// controllers/sprint_controller.js
const { Sprint, Project, SprintCost, User } = require("../db.js");
const { Op } = require("sequelize");

// Get all sprints
async function getAllSprints(req, res) {
	try {
		const sprints = await Sprint.findAll({
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
				},
			],
			order: [["start_date", "DESC"]],
		});
		res.json({ success: true, sprints });
	} catch (error) {
		console.error("Error fetching sprints:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get sprints by project
async function getSprintsByProject(req, res) {
	try {
		const { projectId } = req.params;
		const sprints = await Sprint.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: SprintCost,
					include: [
						{
							model: User,
							attributes: ["id", "name", "email"],
						},
					],
				},
			],
			order: [["start_date", "DESC"]],
		});
		res.json({ success: true, sprints });
	} catch (error) {
		console.error("Error fetching project sprints:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get active sprints
async function getActiveSprints(req, res) {
	try {
		const today = new Date();
		const sprints = await Sprint.findAll({
			where: {
				status: "active",
				start_date: {
					[Op.lte]: today,
				},
				end_date: {
					[Op.gte]: today,
				},
			},
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
				},
				{
					model: SprintCost,
					include: [
						{
							model: User,
							attributes: ["id", "name", "email"],
						},
					],
				},
			],
		});
		res.json({ success: true, sprints });
	} catch (error) {
		console.error("Error fetching active sprints:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get sprints ending soon (next 7 days)
async function getSprintsEndingSoon(req, res) {
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
					attributes: ["id", "name"],
				},
			],
			order: [["end_date", "ASC"]],
		});
		res.json({ success: true, sprints });
	} catch (error) {
		console.error("Error fetching sprints ending soon:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create a new sprint
async function createSprint(req, res) {
	try {
		const {
			project_id,
			name,
			azure_id,
			start_date,
			end_date,
			status,
			budget,
			velocity,
		} = req.body;

		const sprint = await Sprint.create({
			project_id,
			name,
			azure_id,
			start_date,
			end_date,
			status,
			budget,
			velocity,
		});

		const sprintWithProject = await Sprint.findByPk(sprint.id, {
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
				},
			],
		});

		res.json({ success: true, sprint: sprintWithProject });
	} catch (error) {
		console.error("Error creating sprint:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update a sprint
async function updateSprint(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const sprint = await Sprint.findByPk(id);
		if (!sprint) {
			return res
				.status(404)
				.json({ success: false, error: "Sprint not found" });
		}

		await sprint.update(updates);

		const updatedSprint = await Sprint.findByPk(id, {
			include: [
				{
					model: Project,
					attributes: ["id", "name"],
				},
			],
		});

		res.json({ success: true, sprint: updatedSprint });
	} catch (error) {
		console.error("Error updating sprint:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	getAllSprints,
	getSprintsByProject,
	getActiveSprints,
	getSprintsEndingSoon,
	createSprint,
	updateSprint,
};

