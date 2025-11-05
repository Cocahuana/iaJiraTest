// controllers/budget_controller.js
const { SprintCost, Sprint, User, Project, Budget } = require("../db.js");
const { Op } = require("sequelize");
const { OpenAI } = require("openai");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Get all sprint costs
async function getAllSprintCosts(req, res) {
	try {
		const costs = await SprintCost.findAll({
			include: [
				{
					model: Sprint,
					include: [
						{
							model: Project,
							attributes: ["id", "name"],
						},
					],
				},
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});
		res.json({ success: true, costs });
	} catch (error) {
		console.error("Error fetching sprint costs:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get sprint costs by sprint
async function getSprintCostsBySprint(req, res) {
	try {
		const { sprintId } = req.params;
		const costs = await SprintCost.findAll({
			where: { sprint_id: sprintId },
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		// Calculate totals
		const totals = costs.reduce(
			(acc, cost) => {
				acc.allocated_budget += parseFloat(cost.allocated_budget) || 0;
				acc.expected_cost += parseFloat(cost.expected_cost) || 0;
				acc.actual_cost += parseFloat(cost.actual_cost) || 0;
				acc.overrun_amount += parseFloat(cost.overrun_amount) || 0;
				return acc;
			},
			{
				allocated_budget: 0,
				expected_cost: 0,
				actual_cost: 0,
				overrun_amount: 0,
			}
		);

		res.json({ success: true, costs, totals });
	} catch (error) {
		console.error("Error fetching sprint costs:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get budget overruns
async function getBudgetOverruns(req, res) {
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
							attributes: ["id", "name"],
						},
					],
				},
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["overrun_amount", "DESC"]],
		});
		res.json({ success: true, overruns });
	} catch (error) {
		console.error("Error fetching budget overruns:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get budget status by project
async function getBudgetStatusByProject(req, res) {
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
		});

		const budgetStatus = sprints.map((sprint) => {
			const costs = sprint.SprintCosts || [];
			const totals = costs.reduce(
				(acc, cost) => {
					acc.allocated_budget +=
						parseFloat(cost.allocated_budget) || 0;
					acc.expected_cost += parseFloat(cost.expected_cost) || 0;
					acc.actual_cost += parseFloat(cost.actual_cost) || 0;
					acc.overrun_amount += parseFloat(cost.overrun_amount) || 0;
					return acc;
				},
				{
					allocated_budget: 0,
					expected_cost: 0,
					actual_cost: 0,
					overrun_amount: 0,
				}
			);

			return {
				sprint_id: sprint.id,
				sprint_name: sprint.name,
				...totals,
				status:
					totals.overrun_amount > 0
						? "over_budget"
						: totals.actual_cost > totals.expected_cost * 0.9
						? "at_risk"
						: "on_track",
			};
		});

		res.json({ success: true, budgetStatus });
	} catch (error) {
		console.error("Error fetching budget status:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create sprint cost entry
async function createSprintCost(req, res) {
	try {
		const {
			sprint_id,
			user_id,
			allocated_budget,
			expected_cost,
			actual_cost,
			hourly_rate,
			hours_worked,
		} = req.body;

		const overrun_amount =
			actual_cost > expected_cost ? actual_cost - expected_cost : 0;

		const cost = await SprintCost.create({
			sprint_id,
			user_id,
			allocated_budget,
			expected_cost,
			actual_cost,
			overrun_amount,
			hourly_rate,
			hours_worked,
		});

		const costWithDetails = await SprintCost.findByPk(cost.id, {
			include: [
				{
					model: Sprint,
					include: [
						{
							model: Project,
							attributes: ["id", "name"],
						},
					],
				},
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		res.json({ success: true, cost: costWithDetails });
	} catch (error) {
		console.error("Error creating sprint cost:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update sprint cost
async function updateSprintCost(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const cost = await SprintCost.findByPk(id);
		if (!cost) {
			return res
				.status(404)
				.json({ success: false, error: "Sprint cost not found" });
		}

		// Recalculate overrun if actual_cost or expected_cost changed
		if (updates.actual_cost || updates.expected_cost) {
			const actual = updates.actual_cost || cost.actual_cost;
			const expected = updates.expected_cost || cost.expected_cost;
			updates.overrun_amount = actual > expected ? actual - expected : 0;
		}

		await cost.update(updates);

		const updatedCost = await SprintCost.findByPk(id, {
			include: [
				{
					model: Sprint,
					include: [
						{
							model: Project,
							attributes: ["id", "name"],
						},
					],
				},
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		res.json({ success: true, cost: updatedCost });
	} catch (error) {
		console.error("Error updating sprint cost:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// AI-powered budget analysis
async function analyzeBudgetOverrun(req, res) {
	try {
		const { sprintId } = req.params;

		const sprint = await Sprint.findByPk(sprintId, {
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

		if (!sprint) {
			return res
				.status(404)
				.json({ success: false, error: "Sprint not found" });
		}

		const costs = sprint.SprintCosts || [];
		const overrunCosts = costs.filter((c) => c.overrun_amount > 0);

		if (overrunCosts.length === 0) {
			return res.json({
				success: true,
				message: "No budget overruns detected for this sprint",
			});
		}

		const prompt = `
Analiza el siguiente sobrecosto en el sprint "${sprint.name}":

Costos del Sprint:
${JSON.stringify(
	overrunCosts.map((c) => ({
		employee: c.User.name,
		allocated_budget: c.allocated_budget,
		expected_cost: c.expected_cost,
		actual_cost: c.actual_cost,
		overrun_amount: c.overrun_amount,
		hours_worked: c.hours_worked,
		hourly_rate: c.hourly_rate,
	})),
	null,
	2
)}

Por favor, proporciona:
1. Un análisis de las causas principales del sobrecosto
2. Qué empleado tuvo el mayor sobrecosto y por qué
3. Recomendaciones para futuros sprints
4. Si los sobrecostos están justificados o requieren atención

Responde en formato JSON con las claves: analysis, main_causes, top_overspender, recommendations, severity (low/medium/high)
`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"Eres un experto en gestión de presupuestos de proyectos. Devuelve solo JSON válido.",
				},
				{ role: "user", content: prompt },
			],
			response_format: { type: "json_object" },
			temperature: 0.3,
		});

		const analysis = JSON.parse(completion.choices[0].message.content);

		res.json({
			success: true,
			sprint: {
				id: sprint.id,
				name: sprint.name,
				project: sprint.Project.name,
			},
			overruns: overrunCosts.map((c) => ({
				employee: c.User.name,
				overrun_amount: c.overrun_amount,
				actual_cost: c.actual_cost,
				expected_cost: c.expected_cost,
			})),
			analysis,
		});
	} catch (error) {
		console.error("Error analyzing budget overrun:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// ==================== BUDGET MANAGEMENT ====================

// Get all budgets
async function getAllBudgets(req, res) {
	try {
		const budgets = await Budget.findAll({
			include: [
				{
					model: Project,
					attributes: ["id", "name", "description"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.json({ success: true, budgets });
	} catch (error) {
		console.error("Error fetching budgets:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get budgets by project
async function getBudgetsByProject(req, res) {
	try {
		const { projectId } = req.params;

		const budgets = await Budget.findAll({
			where: { project_id: projectId },
			include: [
				{
					model: Project,
					attributes: ["id", "name", "description"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.json({ success: true, budgets });
	} catch (error) {
		console.error("Error fetching project budgets:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get single budget by ID
async function getBudgetById(req, res) {
	try {
		const { id } = req.params;

		const budget = await Budget.findByPk(id, {
			include: [
				{
					model: Project,
					attributes: ["id", "name", "description"],
				},
			],
		});

		if (!budget) {
			return res
				.status(404)
				.json({ success: false, error: "Budget not found" });
		}

		// Get personnel details if there are any
		if (budget.personnel_list && budget.personnel_list.length > 0) {
			const personnelIds = budget.personnel_list.map((p) => p.userId);
			const users = await User.findAll({
				where: { id: personnelIds },
				attributes: ["id", "name", "email", "role"],
			});

			// Enrich personnel list with user details
			const enrichedPersonnel = budget.personnel_list.map((p) => {
				const user = users.find((u) => u.id === p.userId);
				return {
					...p,
					user: user || null,
				};
			});

			budget.dataValues.enrichedPersonnel = enrichedPersonnel;
		}

		res.json({ success: true, budget });
	} catch (error) {
		console.error("Error fetching budget:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create new budget
async function createBudget(req, res) {
	try {
		const {
			project_id,
			name,
			initial_budget,
			initial_investment,
			expected_roi,
			needed_personnel,
			personnel_budget,
			personnel_list,
			description,
			start_date,
			end_date,
		} = req.body;

		// Validation
		if (!project_id || !name || !initial_budget) {
			return res.status(400).json({
				success: false,
				error: "project_id, name, and initial_budget are required",
			});
		}

		// Check if project exists
		const project = await Project.findByPk(project_id);
		if (!project) {
			return res
				.status(404)
				.json({ success: false, error: "Project not found" });
		}

		const budget = await Budget.create({
			project_id,
			name,
			initial_budget,
			initial_investment: initial_investment || 0,
			expected_roi: expected_roi || 0,
			needed_personnel: needed_personnel || 0,
			personnel_budget: personnel_budget || 0,
			personnel_list: personnel_list || [],
			description,
			start_date,
			end_date,
			status: "active",
		});

		const budgetWithDetails = await Budget.findByPk(budget.id, {
			include: [
				{
					model: Project,
					attributes: ["id", "name", "description"],
				},
			],
		});

		res.status(201).json({ success: true, budget: budgetWithDetails });
	} catch (error) {
		console.error("Error creating budget:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update budget
async function updateBudget(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const budget = await Budget.findByPk(id);
		if (!budget) {
			return res
				.status(404)
				.json({ success: false, error: "Budget not found" });
		}

		// Update allowed fields
		const allowedFields = [
			"name",
			"initial_budget",
			"initial_investment",
			"expected_roi",
			"needed_personnel",
			"personnel_budget",
			"personnel_list",
			"description",
			"start_date",
			"end_date",
			"status",
		];

		Object.keys(updates).forEach((key) => {
			if (allowedFields.includes(key)) {
				budget[key] = updates[key];
			}
		});

		await budget.save();

		const updatedBudget = await Budget.findByPk(id, {
			include: [
				{
					model: Project,
					attributes: ["id", "name", "description"],
				},
			],
		});

		res.json({ success: true, budget: updatedBudget });
	} catch (error) {
		console.error("Error updating budget:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Delete budget
async function deleteBudget(req, res) {
	try {
		const { id } = req.params;

		const budget = await Budget.findByPk(id);
		if (!budget) {
			return res
				.status(404)
				.json({ success: false, error: "Budget not found" });
		}

		await budget.destroy();

		res.json({ success: true, message: "Budget deleted successfully" });
	} catch (error) {
		console.error("Error deleting budget:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	// Sprint Cost functions
	getAllSprintCosts,
	getSprintCostsBySprint,
	getBudgetOverruns,
	getBudgetStatusByProject,
	createSprintCost,
	updateSprintCost,
	analyzeBudgetOverrun,
	// Budget functions
	getAllBudgets,
	getBudgetsByProject,
	getBudgetById,
	createBudget,
	updateBudget,
	deleteBudget,
};

