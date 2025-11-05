// routes/budget_routes.js
const express = require("express");
const router = express.Router();
const {
	getAllSprintCosts,
	getSprintCostsBySprint,
	getBudgetOverruns,
	getBudgetStatusByProject,
	createSprintCost,
	updateSprintCost,
	analyzeBudgetOverrun,
	getAllBudgets,
	getBudgetsByProject,
	getBudgetById,
	createBudget,
	updateBudget,
	deleteBudget,
} = require("../controllers/budget_controller");

// Sprint Cost routes
router.get("/costs", getAllSprintCosts);
router.get("/costs/sprint/:sprintId", getSprintCostsBySprint);
router.get("/overruns", getBudgetOverruns);
router.get("/status/project/:projectId", getBudgetStatusByProject);
router.post("/costs", createSprintCost);
router.put("/costs/:id", updateSprintCost);
router.get("/analyze/:sprintId", analyzeBudgetOverrun);

// Budget routes
router.get("/budgets", getAllBudgets);
router.get("/budgets/project/:projectId", getBudgetsByProject);
router.get("/budgets/:id", getBudgetById);
router.post("/budgets", createBudget);
router.put("/budgets/:id", updateBudget);
router.delete("/budgets/:id", deleteBudget);

module.exports = router;

