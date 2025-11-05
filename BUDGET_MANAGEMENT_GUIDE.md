# 💰 Budget Management System - Complete Guide

## Overview

A comprehensive budget management system has been implemented that allows you to:
- Create detailed project budgets
- Track initial investments, expected ROI, and personnel costs
- Assign personnel to budgets with hourly rates and estimated hours
- View and edit budgets
- Monitor budget status (active, completed, cancelled)

## 🎯 Features

### 1. **Budget Creation**
- Create budgets for specific projects
- Define initial budget and investment amounts
- Set expected ROI (Return on Investment)
- Specify needed personnel count
- Allocate budget to individual team members
- Set budget start and end dates

### 2. **Personnel Management**
- Select users from your team
- Assign hourly rates to each person
- Estimate hours for each team member
- Automatic budget calculation based on hours × rate
- Total personnel budget tracking

### 3. **Budget Viewing & Editing**
- View budget details in a clean interface
- See financial overview with key metrics
- View all assigned personnel with their allocations
- Edit budgets to adjust values
- Change budget status (active/completed/cancelled)

### 4. **Budget List**
- View all budgets across all projects
- Filter budgets by specific project
- See budget status at a glance
- Quick access to budget details

## 🚀 How to Use

### Step 1: Access the Budget Page

Navigate to `/budget` in your application.

### Step 2: Select a Project

In the "Filter by Project" dropdown, select the project for which you want to create a budget.

**Note:** The "Create Budget" button will only appear when a specific project is selected (not "All Projects").

### Step 3: Create a New Budget

1. Click the **"Create Budget"** button
2. You'll be redirected to `/budget/create` with the project pre-selected

### Step 4: Fill in Budget Information

#### Basic Information:
- **Budget Name** (required): e.g., "Q1 2024 Development Budget"
- **Start Date**: When the budget period begins
- **End Date**: When the budget period ends
- **Description**: Additional notes about the budget

#### Financial Information:
- **Initial Budget** (required): Total budget allocated
- **Initial Investment**: Upfront investment amount
- **Expected ROI (%)**: Expected return on investment percentage

#### Personnel Budget:
- **Needed Personnel Count**: How many people you need
- **Total Personnel Budget**: Total budget for personnel (auto-calculated from assignments)

### Step 5: Assign Personnel

1. Click **"Add Personnel"**
2. For each person:
   - Select **User** from dropdown
   - Enter **Hourly Rate**
   - Enter **Estimated Hours**
   - Enter **Allocated Budget** (or it will be calculated)
3. Add multiple team members as needed
4. Remove assignments with the trash icon

### Step 6: Save the Budget

Click **"Create Budget"** to save. You'll be redirected to the budget detail page.

### Step 7: View Budget Details

On the budget detail page, you can:
- See financial overview cards
- View all budget details
- See assigned personnel with their allocations
- Edit the budget
- Delete the budget
- Change budget status

### Step 8: Edit a Budget

1. Click **"Edit"** on the budget detail page
2. Modify any fields
3. Add or remove personnel
4. Click **"Save Changes"**

## 📊 Budget List View

The main budget page now has three tabs:

### 1. **Budgets Tab** (Default)
- Shows all created budgets
- Displays key information: name, project, budgets, ROI, status
- "View Budget" button for each entry
- Filter by project to see project-specific budgets

### 2. **Budget Overruns Tab**
- Shows sprints that exceeded their budget
- Helps identify cost overruns
- AI analysis available for each overrun

### 3. **All Sprint Costs Tab**
- View all sprint costs across projects
- Track allocated vs actual costs

## 🗄️ Database Schema

The Budget model includes:

```javascript
{
  id: UUID (Primary Key)
  project_id: UUID (Foreign Key to Projects)
  name: String
  initial_budget: Decimal(12,2)
  initial_investment: Decimal(12,2)
  expected_roi: Decimal(5,2) // Percentage
  needed_personnel: Integer
  personnel_budget: Decimal(12,2)
  personnel_list: JSONB // Array of {userId, allocatedBudget, hourlyRate, estimatedHours}
  status: String // 'active', 'completed', 'cancelled'
  description: Text
  start_date: Date
  end_date: Date
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🔌 API Endpoints

### Budget CRUD Operations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget/budgets` | Get all budgets |
| GET | `/api/budget/budgets/project/:projectId` | Get budgets for a specific project |
| GET | `/api/budget/budgets/:id` | Get single budget by ID |
| POST | `/api/budget/budgets` | Create new budget |
| PUT | `/api/budget/budgets/:id` | Update existing budget |
| DELETE | `/api/budget/budgets/:id` | Delete budget |

### Example API Request (Create Budget):

```javascript
POST /api/budget/budgets

{
  "project_id": "uuid-here",
  "name": "Q1 2024 Budget",
  "initial_budget": 100000,
  "initial_investment": 20000,
  "expected_roi": 15.5,
  "needed_personnel": 5,
  "personnel_budget": 80000,
  "personnel_list": [
    {
      "userId": "user-uuid-1",
      "allocatedBudget": 16000,
      "hourlyRate": 50,
      "estimatedHours": 320
    },
    {
      "userId": "user-uuid-2",
      "allocatedBudget": 24000,
      "hourlyRate": 75,
      "estimatedHours": 320
    }
  ],
  "description": "Q1 development budget for Project X",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31"
}
```

## 📁 File Structure

### Backend:
```
ia_jira_test_api/
├── models/
│   └── budget.js                    # Budget model definition
├── controllers/
│   └── budget_controller.js         # Budget CRUD controllers
├── routes/
│   └── budget_routes.js             # Budget API routes
└── scripts/
    └── syncDatabase.js              # Database sync script
```

### Frontend:
```
ia_jira_test_client/src/pages/
├── budget.tsx                       # Main budget page with list
├── budget/
│   ├── create.tsx                   # Budget creation page
│   └── [id].tsx                     # Budget detail/edit page
```

## 💡 Tips & Best Practices

1. **Budget Planning**
   - Create budgets at the start of each quarter or project phase
   - Include a buffer (10-15%) for unexpected costs

2. **Personnel Allocation**
   - Assign personnel early to ensure availability
   - Update hourly rates based on current market rates
   - Review and adjust estimates after each sprint

3. **ROI Tracking**
   - Set realistic ROI expectations
   - Compare actual results with expected ROI
   - Adjust future budgets based on past performance

4. **Status Management**
   - Keep budgets in "active" status during the budget period
   - Mark as "completed" when the period ends
   - Use "cancelled" for budgets that were terminated early

5. **Regular Reviews**
   - Review budgets weekly or bi-weekly
   - Compare with actual sprint costs
   - Make adjustments as needed

## 🔍 Troubleshooting

### Budget Creation Failed
- Ensure project is selected
- Check that required fields are filled: project_id, name, initial_budget
- Verify database connection

### Personnel Not Loading
- Run `/api/azure/users/sync` to sync users from Azure
- Check that users exist in the database
- Verify API endpoint is responding

### Can't Edit Budget
- Ensure you have proper permissions
- Check that the budget ID is valid
- Verify API connection

## 🎨 UI Screenshots (Description)

### Main Budget Page
- Three tabs: Budgets, Budget Overruns, All Sprint Costs
- Project filter dropdown with "Create Budget" button
- Budget list table with columns: Name, Project, Budgets, ROI, Status, Period, Actions

### Create Budget Page
- Clean form layout with sections:
  - Basic Information (project, name, dates)
  - Financial Information (budget, investment, ROI)
  - Personnel Budget (personnel list with add/remove)
- Cancel and Create buttons

### Budget Detail Page
- Financial overview cards (Initial Budget, Expected ROI, Personnel Budget)
- Budget details section
- Assigned personnel list
- Edit, Delete, and Status change options

## 📈 Future Enhancements

Potential improvements for the future:
- Budget vs Actual cost comparison charts
- Historical budget performance analytics
- Budget approval workflow
- Email notifications for budget milestones
- Export budgets to Excel/PDF
- Budget templates for common project types
- Multi-currency support

---

## ✅ System is Ready!

Your budget management system is now fully operational. Start by:
1. Selecting a project from the dropdown
2. Clicking "Create Budget"
3. Filling in the budget details
4. Saving and tracking your project finances

Happy budgeting! 💰📊

