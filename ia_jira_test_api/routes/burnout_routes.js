// routes/burnout_routes.js
const express = require("express");
const router = express.Router();
const {
	getAllBurnoutMetrics,
	getBurnoutMetricsByUser,
	getBurnoutMetricsByTeam,
	getHighRiskUsers,
	createBurnoutMetric,
	autoCalculateBurnout,
	updateBurnoutMetric,
} = require("../controllers/burnout_controller");

router.get("/", getAllBurnoutMetrics);
router.get("/user/:userId", getBurnoutMetricsByUser);
router.get("/team/:teamId", getBurnoutMetricsByTeam);
router.get("/high-risk", getHighRiskUsers);
router.post("/", createBurnoutMetric);
router.post("/user/:userId/auto-calculate", autoCalculateBurnout);
router.put("/:id", updateBurnoutMetric);

module.exports = router;

