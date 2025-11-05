const express = require("express");
const router = express.Router();
const {
	syncAzureProjects,
} = require("../controllers/azure/azure_projects_controller");

const {
	getAzureBacklog,
	getAzureSprints,
} = require("../controllers/azure/azure_controllers");

const {
	syncAzureUsers,
	getAllUsers,
	getUserById,
	updateUserRole,
} = require("../controllers/azure/azure_users_controller");
const {
	getAzureTasks,
} = require("../controllers/azure/azure_tasks_controller");
const {
	getCurrentSprint,
} = require("../controllers/azure/azure_sprint_controller");

// EXISTENTES
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

// USER MANAGEMENT ROUTES

// Sync users from Azure DevOps to Database
router.get("/users/sync", async (req, res) => {
	try {
		const users = await syncAzureUsers();
		res.json({ success: true, count: users.length, users });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Get all users from database
router.get("/users", async (req, res) => {
	try {
		const users = await getAllUsers();
		res.json({ success: true, count: users.length, users });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
	try {
		const user = await getUserById(req.params.id);
		res.json({ success: true, user });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});

// Update user role
router.put("/users/:id/role", async (req, res) => {
	try {
		const { role } = req.body;
		if (!role) {
			return res.status(400).json({ success: false, error: "Role is required" });
		}
		const user = await updateUserRole(req.params.id, role);
		res.json({ success: true, user });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, error: err.message });
	}
});
// NUEVO: sincronizar proyectos
router.get("/projects/sync", async (req, res) => {
	try {
		const projects = await syncAzureProjects();
		res.json({ success: true, count: projects.length, projects });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// NUEVO: tareas actuales
router.get("/tasks", async (req, res) => {
	try {
		const tasks = await getAzureTasks();
		res.json({ success: true, count: tasks.length, tasks });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});

// NUEVO: sprint actual
router.get("/sprint/current", async (req, res) => {
	try {
		const sprint = await getCurrentSprint();
		res.json({ success: true, sprint });
	} catch (err) {
		res.status(500).json({ success: false, error: err.message });
	}
});
module.exports = router;
