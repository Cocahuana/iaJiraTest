// routes/timeentry_routes.js
const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/timeentry_controller");

router.get("/", getAllTimeEntries);
router.get("/user/:userId", getTimeEntriesByUser);
router.get("/project/:projectId", getTimeEntriesByProject);
router.get("/unbilled", getUnbilledTimeEntries);
router.get("/unapproved", getUnapprovedTimeEntries);
router.get("/missing", getMissingTimeEntries);
router.post("/", createTimeEntry);
router.put("/:id", updateTimeEntry);
router.post("/:id/approve", approveTimeEntry);
router.post("/:id/bill", markTimeEntryBilled);

module.exports = router;

