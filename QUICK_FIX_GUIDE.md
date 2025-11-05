# Quick Fix Guide - Database & Azure Setup

## 🔴 Problem 1: Azure PAT Token Expired

**Error Message:**
```
Access Denied: The Personal Access Token used has expired.
```

### ✅ Solution: Generate New Azure PAT

**Step 1: Go to Azure DevOps Tokens Page**
```
https://dev.azure.com/ezequieldominguez11/_usersSettings/tokens
```

**Step 2: Create New Token**
1. Click "**+ New Token**"
2. Fill in details:
   - **Name**: `PM Management System`
   - **Organization**: `ezequieldominguez11` (auto-selected)
   - **Expiration**: Choose `90 days` or `Custom defined`
   - **Scopes**: Click "**Show all scopes**" and select:
     - ✅ **Graph** → Read
     - ✅ **User Profile (Read)** → Read
     - ✅ **Work Items** → Read
     - ✅ **Project and Team (Read)** → Read

**Step 3: Copy the Token**
- After clicking "Create", **COPY THE TOKEN IMMEDIATELY**
- You won't be able to see it again!

**Step 4: Update .env File**

Open: `ia_jira_test_api/.env`

Update this line:
```bash
AZURE_PAT=your_new_token_here
```

---

## 🔴 Problem 2: Database Tables Don't Exist

**Error Message:**
```
no existe la relación «Users»
```

This means your database exists, but the tables haven't been created yet.

### ✅ Solution: Run Database Sync Script

**Method 1: Using npm script (Recommended)**

```bash
cd ia_jira_test_api
npm run db:sync
```

You should see:
```
✅ Database connection established successfully.
✅ All database tables have been synchronized successfully!

📋 Created/Updated tables:
   - Users
   - Companies
   - Projects
   - Teams
   - Participants
   - Tasks
   - AiQueries
   - Financials
   - Vacations
   - Sprints
   - SprintCosts
   - TimeEntries
   - Notifications
   - BurnoutMetrics

🎉 Database is ready to use!
```

**Method 2: Direct Node Command**

```bash
cd ia_jira_test_api
node scripts/syncDatabase.js
```

---

## 🎯 Complete Setup Steps

### 1. Check Database is Running

**Windows:**
- Open Services (Win + R → `services.msc`)
- Look for "**postgresql-x64-XX**"
- Status should be "**Running**"

**Or test connection:**
```bash
psql -U postgres -d pm_management
```

If you can connect, database is running! Type `\q` to exit.

### 2. Verify .env Configuration

Open: `ia_jira_test_api/.env`

**Required variables:**
```bash
# Database (REQUIRED)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=pm_management

# Azure DevOps (REQUIRED for sync)
AZURE_ORG=ezequieldominguez11
AZURE_PROJECT=your_project_name
AZURE_PAT=your_new_pat_token_here

# Server
PORT=3001
NODE_ENV=development
```

### 3. Sync Database Tables

```bash
cd ia_jira_test_api
npm run db:sync
```

### 4. Start the Server

```bash
npm start
```

### 5. Test Everything Works

**Backend:**
```
http://localhost:3001
```
Should show: `Servidor corriendo en http://localhost:3001` (no errors)

**Frontend:**
```bash
cd ia_jira_test_client
npm run dev
```

Then open: `http://localhost:3000`

---

## 🆘 Troubleshooting

### Issue: "Database does not exist"

**Solution:**
```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pm_management;

# Exit
\q

# Now run sync again
npm run db:sync
```

### Issue: "Connection refused" or "ECONNREFUSED"

**Solution:**
1. PostgreSQL is not running
2. Start it:
   - **Windows**: Services → postgresql-x64-XX → Start
   - **Or**: Start menu → PostgreSQL → Start Server

### Issue: "Authentication failed for user"

**Solution:**
Your DB_PASSWORD in `.env` is wrong.

1. Try connecting manually:
   ```bash
   psql -U postgres
   ```
2. If it asks for password, that's your correct password
3. Update `.env` with the correct password

### Issue: npm run db:sync fails

**Solution:**
```bash
# Make sure you're in the right directory
cd ia_jira_test_api

# Check if the script exists
ls scripts/syncDatabase.js

# Try running directly
node scripts/syncDatabase.js
```

---

## ✅ Success Checklist

- [ ] New Azure PAT token created and added to `.env`
- [ ] Database is running (PostgreSQL service)
- [ ] Database `pm_management` exists
- [ ] `.env` file has all required variables
- [ ] `npm run db:sync` completed successfully
- [ ] `npm start` runs without errors
- [ ] Can access http://localhost:3001
- [ ] Frontend runs with `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] "Users" page in UI shows data (after sync from Azure)

---

## 📝 Quick Commands Reference

```bash
# Backend Setup
cd ia_jira_test_api
npm run db:sync          # Create database tables
npm start                # Start backend server

# Frontend Setup
cd ia_jira_test_client
npm run dev              # Start frontend

# Database Commands
psql -U postgres         # Connect to PostgreSQL
CREATE DATABASE pm_management;  # Create database
\l                       # List databases
\dt                      # List tables (after sync)
\q                       # Quit

# Check if services are running
# Windows: services.msc
# Look for postgresql-x64-XX
```

---

## 🎓 What Does db:sync Do?

The sync script:
1. ✅ Connects to your PostgreSQL database
2. ✅ Creates all 14 tables with proper structure
3. ✅ Sets up all relationships (foreign keys)
4. ✅ Updates existing tables if schema changed
5. ✅ Does NOT delete existing data

**Safe to run multiple times!**

---

## 🔗 Useful Links

- [Azure DevOps PAT Documentation](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
- [PostgreSQL Windows Installation](https://www.postgresql.org/download/windows/)
- [Sequelize Sync Documentation](https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization)

---

**Last Updated:** November 2025  
**Version:** 1.0.0

