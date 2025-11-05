// scripts/syncDatabase.js
require("dotenv").config();
const { conn } = require("../db.js");

async function syncDatabase() {
	try {
		console.log("🔄 Starting database synchronization...");
		console.log(`📊 Database: ${process.env.DB_NAME}`);
		console.log(`🖥️  Host: ${process.env.DB_HOST}`);
		console.log("");

		// Test connection first
		await conn.authenticate();
		console.log("✅ Database connection established successfully.");
		console.log("");

		// Sync all models (creates tables if they don't exist)
		// alter: true will update existing tables
		// force: false will NOT drop existing tables
		await conn.sync({ alter: true });

		console.log("✅ All database tables have been synchronized successfully!");
		console.log("");
		console.log("📋 Created/Updated tables:");
		console.log("   - Users");
		console.log("   - Companies");
		console.log("   - Projects");
		console.log("   - Teams");
		console.log("   - Participants");
		console.log("   - Tasks");
		console.log("   - AiQueries");
		console.log("   - Financials");
		console.log("   - Vacations");
		console.log("   - Sprints");
		console.log("   - SprintCosts");
		console.log("   - TimeEntries");
		console.log("   - Notifications");
		console.log("   - BurnoutMetrics");
		console.log("");
		console.log("🎉 Database is ready to use!");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error synchronizing database:", error);
		console.error("");
		console.error("💡 Common fixes:");
		console.error("   1. Check your .env file has correct DB credentials");
		console.error("   2. Make sure PostgreSQL is running");
		console.error("   3. Make sure the database exists:");
		console.error(`      CREATE DATABASE ${process.env.DB_NAME};`);
		process.exit(1);
	}
}

// Run the sync
syncDatabase();
