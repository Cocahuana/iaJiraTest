const express = require("express");
const router = express.Router();
const {
	getAzureBacklog,
	getAzureSprints,
} = require("../controllers/azure/azure_controllers");

router.get("/backlog", async (req, res) => {
	try {
		const data = await getAzureBacklog();
		res.json({ success: true, backlog: data });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

router.get("/sprints", async (req, res) => {
	try {
		const data = await getAzureSprints();
		res.json({ success: true, sprints: data });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

module.exports = router;
