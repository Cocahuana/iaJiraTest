# User Management System - Azure DevOps Integration

## Overview

This guide explains how to use the User Management system that syncs users from Azure DevOps to your PostgreSQL database and displays them in your UI.

## Features

✅ **Fetch users from Azure DevOps**
- Automatically retrieves all users from your Azure DevOps organization
- Uses Azure DevOps REST API v7.1

✅ **Save users to PostgreSQL**
- Stores user information in your local database
- Uses `upsert` to update existing users and create new ones
- Prevents duplicate entries based on email

✅ **User Management UI**
- Beautiful, modern interface with shadcn/ui components
- Real-time search and filtering
- Role management (Admin, PM, Employee, Executive)
- Export to CSV functionality
- Statistics dashboard

## Setup Instructions

### 1. Backend Configuration

#### Required Environment Variables

Add these to your `ia_jira_test_api/.env` file:

```bash
# Azure DevOps Configuration
AZURE_ORG=your_azure_org_name
AZURE_PROJECT=your_azure_project_name
AZURE_PAT=your_azure_personal_access_token
```

**How to get these values:**

1. **AZURE_ORG**: Your Azure DevOps organization name
   - URL: `https://dev.azure.com/{YOUR_ORG_NAME}`
   - Example: If your URL is `https://dev.azure.com/contoso`, then `AZURE_ORG=contoso`

2. **AZURE_PROJECT**: Your Azure DevOps project name
   - The project you want to sync users from
   - Example: `AZURE_PROJECT=MyProjectName`

3. **AZURE_PAT**: Personal Access Token
   - Go to: `https://dev.azure.com/{YOUR_ORG}/_usersSettings/tokens`
   - Click "New Token"
   - Set name: "PM Management System"
   - Scopes required:
     - ✅ **User Profile (Read)**
     - ✅ **Graph (Read)**
     - ✅ **Work Items (Read)**
   - Copy the generated token

#### Database Setup

The User model is already configured in your database. Run migrations if needed:

```bash
cd ia_jira_test_api
npm run migrate  # or your migration command
```

### 2. Frontend Configuration

Add this to your `ia_jira_test_client/.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the Application

#### Terminal 1 - Backend API:
```bash
cd ia_jira_test_api
npm run dev
# or
node server.js
```

#### Terminal 2 - Frontend:
```bash
cd ia_jira_test_client
npm run dev
```

## API Endpoints

### User Management Endpoints

#### 1. Sync Users from Azure DevOps
```http
GET /api/azure/users/sync
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "role": "employee",
      "auth0_id": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. Get All Users
```http
GET /api/azure/users
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "users": [...]
}
```

#### 3. Get User by ID
```http
GET /api/azure/users/:id
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "employee"
  }
}
```

#### 4. Update User Role
```http
PUT /api/azure/users/:id/role
Content-Type: application/json

{
  "role": "pm"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "role": "pm"
  }
}
```

## Using the UI

### Accessing the User Management Page

1. Start your application
2. Log in with Auth0
3. Navigate to **"Users"** in the sidebar (left menu)

### Syncing Users

1. Click the **"Sync from Azure"** button (top right)
2. Wait for the sync to complete
3. You'll see a success message with the number of users synced
4. Users are now stored in your database and displayed in the table

### Managing Users

#### Search Users
- Use the search bar to filter by name or email
- Search is case-insensitive and searches both fields

#### Filter by Role
- Use the role dropdown to filter users by their role
- Options: All Roles, Admin, PM, Employee, Executive

#### Change User Role
- Click the role dropdown in the "Actions" column for any user
- Select the new role from the dropdown
- The change is saved immediately

#### Export Users
- Click **"Export CSV"** to download a CSV file with all filtered users
- File includes: Name, Email, Role, Created At

### Understanding the Statistics

The dashboard shows:
- **Total Users**: All users in the database
- **Admins**: Users with admin role
- **Project Managers**: Users with PM role
- **Employees**: Users with employee role
- **Executives**: Users with executive role

## Database Schema

### User Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | STRING | User's display name |
| email | STRING | User's email (unique) |
| role | STRING | User role (admin, pm, employee, executive) |
| auth0_id | STRING | Auth0 user ID (nullable, unique) |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

## Roles Explained

- **Admin**: Full system access, can manage all resources
- **PM (Project Manager)**: Can manage projects, sprints, budgets
- **Employee**: Basic access, can track time and view tasks
- **Executive**: Read-only access to reports and dashboards

## Troubleshooting

### Issue: "Error syncing users"

**Solutions:**
1. Verify your AZURE_PAT is correct and not expired
2. Check that your PAT has the required scopes (User Profile, Graph)
3. Verify AZURE_ORG matches your organization name exactly
4. Check backend logs for detailed error messages

### Issue: "No users found after sync"

**Solutions:**
1. Verify users exist in your Azure DevOps organization
2. Check that users have email addresses in Azure DevOps
3. Users without emails are skipped - check backend logs
4. Verify database connection is working

### Issue: "Cannot update user role"

**Solutions:**
1. Check that the backend API is running
2. Verify the user ID is valid
3. Ensure the role value is one of: admin, pm, employee, executive
4. Check browser console for detailed errors

## Security Best Practices

1. **Never commit .env files** to version control
2. **Rotate your Azure PAT** regularly (every 90 days recommended)
3. **Use minimum required scopes** for your Azure PAT
4. **Implement role-based access control** in your application
5. **Audit user role changes** (consider adding an audit log)

## Next Steps

### Recommended Enhancements

1. **Add Auth0 Integration**
   - Link Azure DevOps users with Auth0 accounts
   - Sync roles to Auth0 for authentication

2. **Add Audit Logging**
   - Track who changed user roles and when
   - Log sync operations

3. **Add Bulk Operations**
   - Bulk role assignments
   - Bulk user import/export

4. **Add User Deletion**
   - Soft delete functionality
   - Archive inactive users

5. **Add User Profile Pages**
   - Detailed user information
   - Activity history
   - Associated projects and tasks

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in `ia_jira_test_api`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## API Testing with cURL

### Sync Users
```bash
curl http://localhost:3001/api/azure/users/sync
```

### Get All Users
```bash
curl http://localhost:3001/api/azure/users
```

### Update User Role
```bash
curl -X PUT http://localhost:3001/api/azure/users/{USER_ID}/role \
  -H "Content-Type: application/json" \
  -d '{"role": "pm"}'
```

---

**Version:** 1.0.0  
**Last Updated:** November 2025

