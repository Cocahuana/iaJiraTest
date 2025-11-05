# User Management - Quick Start Guide 🚀

## What Was Implemented

### ✅ Backend (API)

**Files Modified/Created:**
- `ia_jira_test_api/controllers/azure/azure_users_controller.js` - Enhanced with CRUD operations
- `ia_jira_test_api/routes/azure_routes.js` - Added user management endpoints
- `ia_jira_test_api/env.example.txt` - Updated with AZURE_PROJECT variable

**New API Endpoints:**
- `GET /api/azure/users/sync` - Sync users from Azure DevOps
- `GET /api/azure/users` - Get all users from database
- `GET /api/azure/users/:id` - Get specific user
- `PUT /api/azure/users/:id/role` - Update user role

### ✅ Frontend (UI)

**Files Created/Modified:**
- `ia_jira_test_client/src/pages/users.tsx` - Complete user management interface
- `ia_jira_test_client/src/components/ui/SidebarNav.tsx` - Added "Users" menu item

**Features:**
- 📊 Statistics dashboard (Total Users, Admins, PMs, Employees, Executives)
- 🔍 Real-time search by name or email
- 🎯 Filter by role
- ✏️ Update user roles inline
- 📥 Export to CSV
- 🔄 Sync button to fetch from Azure DevOps
- 📱 Responsive design

### ✅ Documentation

**Files Created:**
- `USER_MANAGEMENT_GUIDE.md` - Comprehensive documentation
- `USER_MANAGEMENT_QUICKSTART.md` - This file (quick start)

## Quick Test (5 Minutes)

### Step 1: Configure Environment Variables

**Backend** - `ia_jira_test_api/.env`:
```bash
AZURE_ORG=your_org_name
AZURE_PROJECT=your_project_name
AZURE_PAT=your_personal_access_token
```

> **How to get Azure PAT:**
> 1. Go to: `https://dev.azure.com/{YOUR_ORG}/_usersSettings/tokens`
> 2. Create new token with "User Profile (Read)" and "Graph (Read)" scopes
> 3. Copy and paste into .env

**Frontend** - `ia_jira_test_client/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd ia_jira_test_api
npm install  # if you haven't already
node server.js
```

You should see:
```
Servidor corriendo en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd ia_jira_test_client
npm install  # if you haven't already
npm run dev
```

You should see:
```
Ready on http://localhost:3000
```

### Step 3: Test the API (Optional)

Open a browser or use curl:

```bash
# Test sync endpoint
curl http://localhost:3001/api/azure/users/sync

# Test get users endpoint
curl http://localhost:3001/api/azure/users
```

### Step 4: Use the UI

1. **Open your browser**: `http://localhost:3000`

2. **Log in** with Auth0

3. **Navigate to Users** (in the left sidebar)

4. **Sync Users**:
   - Click the blue "Sync from Azure" button
   - Wait a few seconds
   - You'll see a success message with the user count

5. **Test Features**:
   - ✅ Search for a user by name or email
   - ✅ Filter users by role (use the dropdown)
   - ✅ Change a user's role (click role dropdown in Actions column)
   - ✅ Export to CSV (click "Export CSV" button)

## Expected Results

### After Sync:
- Users from Azure DevOps are saved to your PostgreSQL database
- You see them displayed in a beautiful table
- Statistics cards show counts by role
- All users default to "Employee" role

### Database:
Check your PostgreSQL database:
```sql
SELECT * FROM "Users" ORDER BY name;
```

You should see:
- UUID for each user
- Name and email from Azure DevOps
- Default role: "employee"
- createdAt and updatedAt timestamps

## Troubleshooting

### Problem: "Error syncing users"

**Check:**
1. ✅ Backend is running on port 3001
2. ✅ AZURE_PAT is valid and has correct scopes
3. ✅ AZURE_ORG matches your organization name exactly
4. ✅ Database is running and connected

**Solution:**
```bash
# Check backend logs for detailed error
cd ia_jira_test_api
node server.js
```

### Problem: "No users displayed after sync"

**Check:**
1. Open browser console (F12)
2. Look for errors in Network tab
3. Verify API URL is correct: `http://localhost:3001`

**Test API directly:**
```bash
curl http://localhost:3001/api/azure/users
```

### Problem: "Cannot update role"

**Check:**
1. Backend is running
2. User ID is valid
3. Role is one of: `admin`, `pm`, `employee`, `executive`

## Screenshots Guide

### What You Should See:

**Users Page:**
- Header with "User Management" title
- Blue "Sync from Azure" button
- Statistics cards (5 cards showing counts)
- Search bar and role filter
- Table with users
- Actions column with role dropdown

**After Syncing:**
- Success alert showing number of users synced
- Users populate in the table
- Each user has:
  - Avatar with initial
  - Name and email
  - Role badge (colored)
  - Auth0 status
  - Created date
  - Role selector dropdown

## Next Steps

1. **Assign Roles:**
   - Go through your users
   - Assign appropriate roles (admin, pm, employee, executive)
   - These roles can be used for access control

2. **Integrate with Auth0:**
   - Link Azure users with Auth0 accounts
   - Sync roles to Auth0 for authentication

3. **Test Other Features:**
   - Try the PM Dashboard
   - Check Budget Management
   - Test Time Tracking

## Architecture Overview

```
┌─────────────────┐
│  Azure DevOps   │  (Source of truth for users)
└────────┬────────┘
         │ API Call (via PAT)
         ↓
┌─────────────────┐
│   Backend API   │  (Express.js + PostgreSQL)
│  Port: 3001     │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│   Frontend UI   │  (Next.js 15 + React)
│  Port: 3000     │
└─────────────────┘
```

## Files Changed Summary

### Backend (6 files):
1. `controllers/azure/azure_users_controller.js` ✏️ Enhanced
2. `routes/azure_routes.js` ✏️ Enhanced
3. `env.example.txt` ✏️ Updated
4. `models/user.js` ✅ Already existed
5. `db.js` ✅ Already existed
6. `server.js` ✅ Already configured

### Frontend (3 files):
1. `src/pages/users.tsx` ✨ NEW
2. `src/components/ui/SidebarNav.tsx` ✏️ Enhanced
3. `env.local.example.txt` ✅ Already existed

### Documentation (2 files):
1. `USER_MANAGEMENT_GUIDE.md` ✨ NEW
2. `USER_MANAGEMENT_QUICKSTART.md` ✨ NEW

## Success Criteria ✅

You know everything is working when:
- ✅ Backend starts without errors
- ✅ Frontend starts without errors
- ✅ "Users" appears in the sidebar
- ✅ Users page loads
- ✅ Sync button fetches users from Azure
- ✅ Users display in the table
- ✅ You can search and filter users
- ✅ You can change user roles
- ✅ You can export to CSV
- ✅ Users are saved in PostgreSQL

## Support

For detailed information, see `USER_MANAGEMENT_GUIDE.md`

**Common Commands:**

```bash
# Start backend
cd ia_jira_test_api && node server.js

# Start frontend
cd ia_jira_test_client && npm run dev

# Test API
curl http://localhost:3001/api/azure/users/sync

# Check database
psql -U your_user -d pm_management -c "SELECT * FROM \"Users\";"
```

---

**🎉 Congratulations!** You now have a complete user management system integrated with Azure DevOps!

