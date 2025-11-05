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
} = require("../controllers/budget_controller");

router.get("/costs", getAllSprintCosts);
router.get("/costs/sprint/:sprintId", getSprintCostsBySprint);
router.get("/overruns", getBudgetOverruns);
router.get("/status/project/:projectId", getBudgetStatusByProject);
router.post("/costs", createSprintCost);
router.put("/costs/:id", updateSprintCost);
router.get("/analyze/:sprintId", analyzeBudgetOverrun);

module.exports = router;

