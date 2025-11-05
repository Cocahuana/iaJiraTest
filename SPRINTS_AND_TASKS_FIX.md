# 🚀 Sprints View & Tasks UUID Fix

## Issues Resolved

### Issue 1: UUID Error in Tasks ✅

**Problem:**
```json
{
  "success": false,
  "error": "la sintaxis de entrada no es válida para tipo uuid: «11»"
}
```

**Root Cause:**
The Task model expected a UUID primary key, but Azure DevOps work item IDs are integers (like 11, 234, etc.). When trying to save Azure tasks, the system attempted to use the Azure ID as the UUID, causing a validation error.

**Solution:**
- Added `azure_id` field to Task model to store Azure DevOps work item IDs
- Modified Azure tasks controller to save the Azure ID in the new field
- Let the UUID be auto-generated for internal database use

### Issue 2: Sprints View ✅

**Requirement:**
Create a new view to see:
- Current/active sprints prominently displayed
- Past sprints (completed)
- Future sprints (planned)

**Solution:**
Created a comprehensive Sprints page at `/sprints` with full sprint management capabilities.

---

## Changes Made

### 1. Task Model Update

**File:** `ia_jira_test_api/models/task.js`

Added `azure_id` field:
```javascript
azure_id: {
  type: DataTypes.INTEGER,
  unique: true,
  allowNull: true,
}
```

This allows:
- Internal UUID for database relationships
- Azure ID for tracking work items from Azure DevOps
- Proper synchronization without conflicts

### 2. Azure Tasks Controller Fix

**File:** `ia_jira_test_api/controllers/azure/azure_tasks_controller.js`

Updated the task upsert:
```javascript
await Task.upsert(
  {
    azure_id: item.id,              // Store Azure ID here
    title: item.fields["System.Title"],
    status: item.fields["System.State"] || "New",
    priority: item.fields["Microsoft.VSTS.Common.Priority"] || null,
    description: item.fields["System.Description"] || null,
    project_id: null,
    assignee_id: null,
  },
  {
    conflictFields: ["azure_id"],   // Use azure_id for conflict detection
  }
);
```

### 3. New Sprints Page

**File:** `ia_jira_test_client/src/pages/sprints.tsx`

Created a comprehensive sprints management page with:

#### Features:
- **Summary Dashboard**
  - Active sprints count
  - Completed sprints count
  - Average velocity
  - Total budget across all sprints

- **Current Sprints Section**
  - Highlighted with green border
  - Progress bar showing days remaining
  - Key metrics: budget, velocity, completed points
  - Visual countdown to sprint end

- **Planned Sprints Section**
  - Table view of upcoming sprints
  - Start/end dates
  - Duration calculation
  - Budget information

- **Past Sprints Section**
  - Historical sprint data
  - Velocity and completion metrics
  - Performance tracking
  - Completed status badges

- **Project Filtering**
  - Filter sprints by project
  - "All Projects" view
  - Automatic refresh when filter changes

### 4. Navigation Update

**File:** `ia_jira_test_client/src/components/ui/SidebarNav.tsx`

Added Sprints to the main navigation menu:
```javascript
{ title: "Sprints", icon: Zap, href: "/sprints" }
```

### 5. Database Sync

Ran database synchronization to apply schema changes:
- Added `azure_id` column to Tasks table
- All tables updated successfully

---

## How to Use

### Accessing Sprints View

1. **Navigate to Sprints**
   - Click "Sprints" in the sidebar navigation
   - Or visit: `http://localhost:3000/sprints`

2. **View Current Sprint**
   - Current sprints are displayed prominently at the top
   - Green border and "Active" badge
   - Progress bar shows time remaining
   - Key metrics visible at a glance

3. **Filter by Project**
   - Use the project dropdown to filter sprints
   - Select "All Projects" to see everything
   - Filter automatically updates the view

4. **Review Past Performance**
   - Scroll to "Past Sprints" section
   - See completed sprint metrics
   - Track velocity and completion rates
   - Compare against planned values

### Testing Tasks Endpoint

The tasks endpoint should now work correctly:

```bash
GET http://localhost:3001/api/azure/tasks
```

Expected response:
```json
{
  "success": true,
  "count": 30,
  "tasks": [
    {
      "id": 11,
      "title": "Task Title",
      "state": "Active",
      "assignedTo": "User Name"
    }
  ]
}
```

---

## Sprint Status Types

The system recognizes three sprint statuses:

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| **Active** | Green | PlayCircle | Currently running sprint |
| **Completed** | Blue | CheckCircle | Finished sprint with results |
| **Planned** | Orange | CalendarClock | Upcoming sprint not started yet |

---

## Sprint Metrics Explained

### 1. **Velocity**
- Story points completed per sprint
- Used to predict future capacity
- Average calculated across completed sprints

### 2. **Completed Points**
- Total story points finished in a sprint
- Shown in "Current Sprint" and "Past Sprints"
- Badge display for easy visibility

### 3. **Budget**
- Financial allocation for the sprint
- Tracked across all sprints
- Total budget shown in summary cards

### 4. **Duration**
- Days from start to end date
- Auto-calculated for each sprint
- Displayed in table views

### 5. **Days Remaining**
- Only for active sprints
- Countdown to sprint end
- Updates daily

---

## API Endpoints Used

### Sprints:
- `GET /api/sprints` - Get all sprints
- `GET /api/sprints/project/:projectId` - Get sprints by project
- `GET /api/sprints/active` - Get active sprints only

### Projects:
- `GET /api/azure/projects/sync` - Get all projects

### Tasks:
- `GET /api/azure/tasks` - Get all tasks from Azure DevOps (now working!)

---

## Visual Elements

### Current Sprint Card Features:
- 📊 **Progress Bar** - Visual representation of sprint timeline
- 📅 **Start/End Dates** - Clear date display
- ⚡ **Key Metrics** - Budget, velocity, completed points
- 🎯 **Days Remaining** - Countdown timer
- 🏷️ **Status Badge** - Active status indicator

### Summary Cards:
- 🟢 **Active Sprints** - Green PlayCircle icon
- 🔵 **Completed Sprints** - Blue CheckCircle icon
- 🟣 **Average Velocity** - Purple TrendingUp icon
- 🟠 **Total Budget** - Orange DollarSign icon

---

## Benefits

### For Project Managers:
- ✅ Quick view of current sprint status
- ✅ Historical sprint performance data
- ✅ Team velocity tracking
- ✅ Budget monitoring across sprints

### For Team Members:
- ✅ Clear visibility of current sprint
- ✅ Understanding of sprint timeline
- ✅ Progress visualization
- ✅ Team performance metrics

### For Stakeholders:
- ✅ Sprint completion rates
- ✅ Budget utilization
- ✅ Team capacity planning
- ✅ Historical performance trends

---

## Troubleshooting

### Tasks Still Showing UUID Error

If you still see UUID errors:

1. **Ensure database is synced:**
   ```bash
   cd ia_jira_test_api
   npm run db:sync
   ```

2. **Check Task model has azure_id:**
   - Open `ia_jira_test_api/models/task.js`
   - Verify `azure_id` field exists

3. **Restart API server:**
   ```bash
   cd ia_jira_test_api
   npm start
   ```

### Sprints Not Showing

If no sprints appear:

1. **Check if sprints exist in database:**
   - Verify sprints are created in your system
   - Check Sprint table in pgAdmin

2. **Verify API connection:**
   - Open browser console
   - Check for API errors
   - Ensure backend is running

3. **Try refreshing:**
   - Click "Refresh" button on sprints page
   - Clear browser cache if needed

### Project Filter Not Working

If project filtering doesn't work:

1. **Check project data:**
   - Ensure projects are synced from Azure
   - Verify sprints have project_id set

2. **Inspect console:**
   - Open browser developer tools
   - Check for JavaScript errors
   - Verify API responses

---

## Testing Checklist

- ✅ Tasks endpoint returns data without UUID error
- ✅ Sprints page loads successfully
- ✅ Current sprints display with progress bars
- ✅ Past sprints show in table format
- ✅ Project filter works correctly
- ✅ Navigation includes "Sprints" link
- ✅ Summary cards show accurate counts
- ✅ Date formatting is correct
- ✅ Status badges display with correct colors
- ✅ Refresh button updates data

---

## Future Enhancements

Potential improvements for the Sprints view:

- 📊 Sprint burndown charts
- 📈 Velocity trend graphs
- 🎯 Sprint goal tracking
- 👥 Team capacity planning
- 📝 Sprint retrospective notes
- 🔄 Sprint comparison tool
- 📧 Sprint end notifications
- 📱 Mobile-responsive design enhancements

---

## Summary

✅ **Tasks UUID Issue:** Fixed by adding `azure_id` field to Task model  
✅ **Sprints View:** Complete sprint management page created  
✅ **Navigation:** Sprints added to sidebar menu  
✅ **Database:** Schema updated and synced  
✅ **Features:** Current, planned, and past sprints all visible  

Both issues have been fully resolved and are ready for use! 🎉

