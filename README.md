# PM Management System

A comprehensive project management system designed to automate and centralize PM workflows, replacing multiple Excel spreadsheets with a unified dashboard.

## 🎯 Features

### Core Functionality

1. **PM Dashboard** - Central hub with all KPIs and critical alerts
2. **Vacation Tracking** - Manage team vacations and time off
3. **Budget Management** - Track sprint costs, overruns, and analyze budget issues with AI
4. **Time Tracking & Billing** - Track unbilled hours and approve time entries
5. **Task Status Dashboard** - Monitor tasks of absent employees
6. **Notifications Center** - Centralized alerts and reminders
7. **Automated Reminders** - Email and Teams notifications for critical events

### AI-Powered Features

- **Budget Analysis** - AI analyzes budget overruns and provides recommendations
- **Predictive Alerts** - Proactive notifications about potential issues
- **Burnout Detection** - Automatic calculation and alerts for team member burnout

### Automated Alerts

The system automatically sends notifications for:
- Budget overruns
- Sprints ending soon
- High burnout risk team members
- Upcoming vacations
- Missing time entries

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API
- PostgreSQL database with Sequelize ORM
- Azure DevOps integration
- OpenAI integration for AI analysis
- Scheduled jobs using node-cron
- Email notifications via nodemailer
- Microsoft Teams webhooks

### Frontend (Next.js/React)
- Modern UI with SHADCN components
- Auth0 authentication
- Real-time dashboard updates
- Responsive design with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Azure DevOps account with Personal Access Token
- OpenAI API key
- Auth0 account
- (Optional) Microsoft Teams webhook URL
- (Optional) Email account for SMTP

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iaJiraTest
```

### 2. Backend Setup

```bash
cd ia_jira_test_api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Sync database (creates all tables)
node scripts/syncDatabase.js

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd ia_jira_test_client

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your configuration
nano .env.local

# Start the development server
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_NAME=pm_management

# Azure DevOps
AZURE_ORG=your_azure_org_name
AZURE_PAT=your_azure_personal_access_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Email
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your_email@company.com
EMAIL_PASSWORD=your_email_password

# Notifications
EMAIL_NOTIFICATIONS_ENABLED=true
TEAMS_NOTIFICATIONS_ENABLED=false
TEAMS_WEBHOOK_URL=https://your-teams-webhook-url
```

### Frontend Environment Variables

```env
# Auth0
AUTH0_SECRET=your_secret_key
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Setting up Microsoft Teams Notifications (Optional)

1. Go to your Teams channel
2. Click on the three dots next to the channel name
3. Select "Connectors"
4. Search for "Incoming Webhook" and configure it
5. Copy the webhook URL and add it to your .env file

### Setting up Email Notifications

For Outlook/Office365:
- Use your company email and password
- If using 2FA, create an App Password in your Microsoft account

For other email providers:
- Update SMTP_HOST and SMTP_PORT accordingly
- Gmail: smtp.gmail.com:587
- Yahoo: smtp.mail.yahoo.com:587

## 📊 Database Schema

The system uses the following main models:

- **Users** - Team members and PMs
- **Projects** - Azure DevOps projects
- **Sprints** - Sprint information
- **Tasks** - Individual tasks/tickets
- **Vacations** - Time off records
- **SprintCosts** - Budget tracking per user per sprint
- **TimeEntries** - Time tracking and billing
- **Notifications** - System notifications
- **BurnoutMetrics** - Team burnout tracking

## 🔄 Scheduled Jobs

The system runs the following automated jobs:

- **Daily 8:00 AM** - Generate AI summaries of projects
- **Daily 9:00 AM** - Run all reminder checks (budget, sprints, vacations, etc.)
- **Hourly** - Check for critical burnout alerts
- **Daily 6:00 PM** - Check for missing time entries

To disable scheduled jobs, set `ENABLE_CRON_JOBS=false` in your .env file.

## 📱 API Endpoints

### Vacations
- `GET /api/vacations` - Get all vacations
- `GET /api/vacations/upcoming` - Get upcoming vacations
- `GET /api/vacations/current` - Get current vacations
- `POST /api/vacations` - Create vacation
- `PUT /api/vacations/:id` - Update vacation
- `DELETE /api/vacations/:id` - Delete vacation

### Budget
- `GET /api/budget/overruns` - Get budget overruns
- `GET /api/budget/costs` - Get all sprint costs
- `GET /api/budget/analyze/:sprintId` - AI analysis of overrun
- `POST /api/budget/costs` - Create sprint cost entry
- `PUT /api/budget/costs/:id` - Update sprint cost

### Time Entries
- `GET /api/timeentries/unbilled` - Get unbilled entries
- `GET /api/timeentries/unapproved` - Get unapproved entries
- `GET /api/timeentries/missing` - Get users with missing entries
- `POST /api/timeentries/:id/approve` - Approve time entry
- `POST /api/timeentries/:id/bill` - Mark as billed

### Notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read

### Burnout
- `GET /api/burnout/high-risk` - Get high-risk users
- `GET /api/burnout/user/:userId` - Get user burnout metrics
- `POST /api/burnout` - Create burnout metric

## 🎨 Frontend Pages

- `/` - Organization dashboard
- `/pm-dashboard` - Main PM dashboard with all KPIs
- `/budget` - Budget management and analysis
- `/vacations` - Vacation tracker
- `/timetracking` - Time tracking and billing
- `/task-status` - Task status for absent employees
- `/notifications` - Notifications center

## 🔐 Security

- Auth0 authentication for secure login
- Role-based access control (Admin, PM, Employee, Executive)
- Environment variables for sensitive data
- CORS protection
- SQL injection protection via Sequelize ORM

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in .env
- Check if database exists: `psql -U postgres -c "CREATE DATABASE pm_management;"`

### Azure DevOps Connection Issues
- Verify your Personal Access Token has proper permissions
- Check if AZURE_ORG is correct (organization name only, not full URL)

### Email Notifications Not Working
- Verify SMTP settings
- Check if email/password are correct
- For Office365, ensure less secure app access is enabled or use app password

### Scheduled Jobs Not Running
- Ensure ENABLE_CRON_JOBS=true
- Check server logs for cron job execution
- Verify server timezone matches your expected schedule

## 📈 Future Enhancements

- [ ] Mobile app
- [ ] Advanced reporting and analytics
- [ ] Integration with more project management tools
- [ ] Custom alert configurations per PM
- [ ] Team capacity planning
- [ ] Resource allocation optimization

## 🤝 Contributing

This is a proprietary system for internal use. Contact the development team for contributions.

## 📄 License

Proprietary - All rights reserved

## 💬 Support

For support and questions, contact your IT department or the development team.

---

**Built with ❤️ for Project Managers**

