// routes/vacation_routes.js
const express = require("express");
const router = express.Router();
const {
	getAllVacations,
	getVacationsByUser,
	getUpcomingVacations,
	getCurrentVacations,
	createVacation,
	updateVacation,
	deleteVacation,
} = require("../controllers/vacation_controller");

router.get("/", getAllVacations);
router.get("/user/:userId", getVacationsByUser);
router.get("/upcoming", getUpcomingVacations);
router.get("/current", getCurrentVacations);
router.post("/", createVacation);
router.put("/:id", updateVacation);
router.delete("/:id", deleteVacation);

module.exports = router;

