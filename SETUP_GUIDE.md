# Setup Guide - PM Management System

## Quick Start Guide

Follow these steps to get your PM Management System up and running.

## Step 1: Install Dependencies

### Backend
```bash
cd ia_jira_test_api
npm install
```

### Frontend
```bash
cd ia_jira_test_client
npm install
```

## Step 2: Configure Environment Variables

### Backend (.env)

1. Copy the example file:
```bash
cd ia_jira_test_api
cp env.example.txt .env
```

2. Edit the `.env` file with your actual credentials:

```env
# Required Configuration
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_NAME=pm_management

# Azure DevOps
AZURE_ORG=your_organization_name
AZURE_PAT=your_personal_access_token

# OpenAI (for AI analysis features)
OPENAI_API_KEY=sk-your-openai-api-key

# Email Notifications
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-email-password
EMAIL_NOTIFICATIONS_ENABLED=true

# Optional: Microsoft Teams
TEAMS_NOTIFICATIONS_ENABLED=false
TEAMS_WEBHOOK_URL=your-teams-webhook-url
```

### Frontend (.env.local)

1. Copy the example file:
```bash
cd ia_jira_test_client
cp env.local.example.txt .env.local
```

2. Edit the `.env.local` file:

```env
# Auth0 Configuration
AUTH0_SECRET=your-32-character-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 3: Set Up the Database

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pm_management;

# Exit psql
\q
```

### Sync Database Tables

```bash
cd ia_jira_test_api
node scripts/syncDatabase.js
```

This will create all necessary tables:
- Users
- Companies
- Projects
- Teams
- Participants
- Tasks
- Vacations
- Sprints
- Sprint Costs
- Time Entries
- Notifications
- Burnout Metrics
- And more...

## Step 4: Set Up Azure DevOps Integration

### Get Your Personal Access Token (PAT)

1. Go to Azure DevOps: https://dev.azure.com/
2. Click on your profile picture → Security
3. Click "New Token"
4. Set the following permissions:
   - **Project and Team**: Read
   - **Work Items**: Read, Write
   - **Code**: Read
5. Copy the token and add it to your `.env` file

### Configure Organization

Add your Azure DevOps organization name (not the full URL) to the `.env` file:
```
AZURE_ORG=your-org-name
```

## Step 5: Set Up Auth0

### Create Auth0 Application

1. Go to https://auth0.com/
2. Create a new "Regular Web Application"
3. Note down:
   - Domain
   - Client ID
   - Client Secret
4. Add these to your `.env.local` file

### Configure Auth0 Application

In Auth0 Dashboard:
1. Go to Application Settings
2. Add Allowed Callback URLs:
   ```
   http://localhost:3000/api/auth/callback
   ```
3. Add Allowed Logout URLs:
   ```
   http://localhost:3000
   ```
4. Save changes

## Step 6: Set Up OpenAI (for AI Features)

1. Go to https://platform.openai.com/
2. Create an API key
3. Add it to your `.env` file:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

## Step 7: Set Up Email Notifications (Optional but Recommended)

### For Office365/Outlook:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASSWORD=your-password-or-app-password
EMAIL_NOTIFICATIONS_ENABLED=true
```

**Note**: If using 2FA, create an App Password:
1. Go to https://account.microsoft.com/security
2. Click "Advanced security options"
3. Click "Create a new app password"
4. Use this password in the `.env` file

### For Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_NOTIFICATIONS_ENABLED=true
```

**Note**: You need to enable "App Passwords" in your Google Account.

## Step 8: Set Up Microsoft Teams Notifications (Optional)

### Create Incoming Webhook:

1. Open Microsoft Teams
2. Go to the channel where you want notifications
3. Click the three dots next to the channel name
4. Select "Connectors"
5. Search for "Incoming Webhook"
6. Click "Configure"
7. Name it (e.g., "PM Management Alerts")
8. Copy the webhook URL
9. Add to your `.env` file:
   ```env
   TEAMS_NOTIFICATIONS_ENABLED=true
   TEAMS_WEBHOOK_URL=your-webhook-url-here
   ```

## Step 9: Start the Applications

### Terminal 1 - Backend:
```bash
cd ia_jira_test_api
npm run dev
```

The API will be available at: http://localhost:3001

### Terminal 2 - Frontend:
```bash
cd ia_jira_test_client
npm run dev
```

The web app will be available at: http://localhost:3000

## Step 10: Initial Data Setup

### Sync Azure DevOps Data

Once the application is running, trigger the initial sync:

1. **Sync Users**:
   ```
   GET http://localhost:3001/api/azure/users/sync
   ```

2. **Sync Projects**:
   ```
   GET http://localhost:3001/api/azure/projects/sync
   ```

3. **Sync Tasks**:
   ```
   GET http://localhost:3001/api/azure/tasks
   ```

You can use tools like Postman or curl to trigger these endpoints, or access them directly in your browser.

## Step 11: Test the System

### Test API:
```bash
curl http://localhost:3001/api/vacations
```

### Test Frontend:
1. Open http://localhost:3000
2. Click "Login"
3. Authenticate with Auth0
4. You should see the dashboard

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start postgresql-x64-14
```

### Auth0 Callback Error
```
Callback URL mismatch
```
**Solution**: Add the callback URL in Auth0 Dashboard → Application Settings → Allowed Callback URLs

### Azure DevOps Connection Error
```
Error: Invalid PAT
```
**Solution**: 
1. Verify your PAT hasn't expired
2. Check if the PAT has the correct permissions
3. Ensure AZURE_ORG is just the organization name, not the full URL

### Email Notifications Not Sending
```
Error: Invalid login
```
**Solution**:
1. Check if 2FA is enabled - use App Password instead
2. Verify SMTP settings are correct
3. Test with a simple email client first

## Scheduled Jobs

The system automatically runs these jobs:

- **8:00 AM Daily**: AI project summaries
- **9:00 AM Daily**: All reminder checks (budget, sprints, vacations)
- **Every Hour**: Critical burnout alerts
- **6:00 PM Daily**: Missing time entry checks

To disable scheduled jobs during development:
```env
ENABLE_CRON_JOBS=false
```

## Production Deployment

### Important Production Settings:

1. **Generate secure AUTH0_SECRET**:
   ```bash
   openssl rand -hex 32
   ```

2. **Update URLs**:
   ```env
   AUTH0_BASE_URL=https://your-production-domain.com
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

3. **Set NODE_ENV**:
   ```env
   NODE_ENV=production
   ```

4. **Use environment-specific database**

5. **Enable HTTPS**

6. **Set up proper CORS policies**

## Next Steps

1. **Configure User Roles**: Set up PM, Admin, Employee roles in Auth0
2. **Import Initial Data**: Import your existing projects and team data
3. **Customize Notifications**: Adjust notification schedules in `server.js`
4. **Set Up Backup**: Configure automated database backups
5. **Monitor Logs**: Set up log aggregation and monitoring

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Review API endpoints documentation
3. Contact your development team

---

🎉 **Congratulations!** Your PM Management System is now set up and ready to use!

