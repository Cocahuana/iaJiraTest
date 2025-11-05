// controllers/vacation_controller.js
const { Vacation, User } = require("../db.js");
const { Op } = require("sequelize");

// Get all vacations
async function getAllVacations(req, res) {
	try {
		const vacations = await Vacation.findAll({
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["start_date", "DESC"]],
		});
		res.json({ success: true, vacations });
	} catch (error) {
		console.error("Error fetching vacations:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get vacations by user
async function getVacationsByUser(req, res) {
	try {
		const { userId } = req.params;
		const vacations = await Vacation.findAll({
			where: { user_id: userId },
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["start_date", "DESC"]],
		});
		res.json({ success: true, vacations });
	} catch (error) {
		console.error("Error fetching user vacations:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get upcoming vacations (next 30 days)
async function getUpcomingVacations(req, res) {
	try {
		const today = new Date();
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(today.getDate() + 30);

		const vacations = await Vacation.findAll({
			where: {
				start_date: {
					[Op.between]: [today, thirtyDaysFromNow],
				},
				status: "approved",
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
			order: [["start_date", "ASC"]],
		});
		res.json({ success: true, vacations });
	} catch (error) {
		console.error("Error fetching upcoming vacations:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Get who is on vacation today
async function getCurrentVacations(req, res) {
	try {
		const today = new Date();
		const vacations = await Vacation.findAll({
			where: {
				start_date: {
					[Op.lte]: today,
				},
				end_date: {
					[Op.gte]: today,
				},
				status: "approved",
			},
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});
		res.json({ success: true, vacations });
	} catch (error) {
		console.error("Error fetching current vacations:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Create a new vacation
async function createVacation(req, res) {
	try {
		const { user_id, start_date, end_date, type, status, notes } = req.body;
		
		const vacation = await Vacation.create({
			user_id,
			start_date,
			end_date,
			type,
			status,
			notes,
		});

		const vacationWithUser = await Vacation.findByPk(vacation.id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		res.json({ success: true, vacation: vacationWithUser });
	} catch (error) {
		console.error("Error creating vacation:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Update a vacation
async function updateVacation(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const vacation = await Vacation.findByPk(id);
		if (!vacation) {
			return res
				.status(404)
				.json({ success: false, error: "Vacation not found" });
		}

		await vacation.update(updates);

		const updatedVacation = await Vacation.findByPk(id, {
			include: [
				{
					model: User,
					attributes: ["id", "name", "email"],
				},
			],
		});

		res.json({ success: true, vacation: updatedVacation });
	} catch (error) {
		console.error("Error updating vacation:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

// Delete a vacation
async function deleteVacation(req, res) {
	try {
		const { id } = req.params;
		const vacation = await Vacation.findByPk(id);

		if (!vacation) {
			return res
				.status(404)
				.json({ success: false, error: "Vacation not found" });
		}

		await vacation.destroy();
		res.json({ success: true, message: "Vacation deleted successfully" });
	} catch (error) {
		console.error("Error deleting vacation:", error);
		res.status(500).json({ success: false, error: error.message });
	}
}

module.exports = {
	getAllVacations,
	getVacationsByUser,
	getUpcomingVacations,
	getCurrentVacations,
	createVacation,
	updateVacation,
	deleteVacation,
};

