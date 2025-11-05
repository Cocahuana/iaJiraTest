// routes/sprint_routes.js
const express = require("express");
const router = express.Router();
const {
	getAllSprints,
	getSprintsByProject,
	getActiveSprints,
	getSprintsEndingSoon,
	createSprint,
	updateSprint,
} = require("../controllers/sprint_controller");

router.get("/", getAllSprints);
router.get("/project/:projectId", getSprintsByProject);
router.get("/active", getActiveSprints);
router.get("/ending-soon", getSprintsEndingSoon);
router.post("/", createSprint);
router.put("/:id", updateSprint);

module.exports = router;

