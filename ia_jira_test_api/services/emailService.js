// services/emailService.js
const nodemailer = require("nodemailer");

// Configure email transporter (using Outlook/Office365)
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.office365.com",
	port: process.env.SMTP_PORT || 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// Send email notification
async function sendEmail({ to, subject, html, text }) {
	try {
		const info = await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to,
			subject,
			text,
			html,
		});

		console.log("Email sent:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending email:", error);
		return { success: false, error: error.message };
	}
}

// Send budget overrun alert
async function sendBudgetOverrunAlert({ to, projectName, sprintName, amount }) {
	const subject = `⚠️ Budget Overrun Alert: ${projectName} - ${sprintName}`;
	const html = `
		<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
			<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #dc3545; margin-bottom: 20px;">⚠️ Budget Overrun Alert</h2>
				<p style="font-size: 16px; line-height: 1.6;">
					The sprint <strong>${sprintName}</strong> in project <strong>${projectName}</strong> 
					has exceeded its budget by <strong style="color: #dc3545;">$${amount}</strong>.
				</p>
				<p style="font-size: 14px; color: #666; margin-top: 20px;">
					Please review the sprint costs and take necessary action.
				</p>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
					<p style="font-size: 12px; color: #999; margin: 0;">
						This is an automated notification from PM Management System
					</p>
				</div>
			</div>
		</div>
	`;

	return await sendEmail({ to, subject, html });
}

// Send sprint ending reminder
async function sendSprintEndingReminder({ to, projectName, sprintName, daysLeft }) {
	const subject = `📅 Sprint Ending Soon: ${projectName} - ${sprintName}`;
	const html = `
		<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
			<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #0d6efd; margin-bottom: 20px;">📅 Sprint Ending Soon</h2>
				<p style="font-size: 16px; line-height: 1.6;">
					The sprint <strong>${sprintName}</strong> in project <strong>${projectName}</strong> 
					will end in <strong style="color: #0d6efd;">${daysLeft} days</strong>.
				</p>
				<p style="font-size: 14px; color: #666; margin-top: 20px;">
					Please ensure all tasks are completed and prepare for sprint review.
				</p>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
					<p style="font-size: 12px; color: #999; margin: 0;">
						This is an automated notification from PM Management System
					</p>
				</div>
			</div>
		</div>
	`;

	return await sendEmail({ to, subject, html });
}

// Send burnout alert
async function sendBurnoutAlert({ to, employeeName, burnoutScore, stressLevel }) {
	const subject = `🔥 Burnout Alert: ${employeeName}`;
	const html = `
		<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
			<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #dc3545; margin-bottom: 20px;">🔥 Burnout Alert</h2>
				<p style="font-size: 16px; line-height: 1.6;">
					Employee <strong>${employeeName}</strong> has a high burnout score of 
					<strong style="color: #dc3545;">${burnoutScore}/100</strong> 
					with stress level: <strong>${stressLevel}</strong>.
				</p>
				<p style="font-size: 14px; color: #666; margin-top: 20px;">
					Please check in with this team member and consider workload adjustments.
				</p>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
					<p style="font-size: 12px; color: #999; margin: 0;">
						This is an automated notification from PM Management System
					</p>
				</div>
			</div>
		</div>
	`;

	return await sendEmail({ to, subject, html });
}

// Send vacation reminder
async function sendVacationReminder({ to, employeeName, startDate, endDate }) {
	const subject = `🏖️ Upcoming Vacation: ${employeeName}`;
	const html = `
		<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
			<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #0d6efd; margin-bottom: 20px;">🏖️ Upcoming Vacation Reminder</h2>
				<p style="font-size: 16px; line-height: 1.6;">
					<strong>${employeeName}</strong> will be on vacation from 
					<strong>${new Date(startDate).toLocaleDateString()}</strong> to 
					<strong>${new Date(endDate).toLocaleDateString()}</strong>.
				</p>
				<p style="font-size: 14px; color: #666; margin-top: 20px;">
					Please plan accordingly and ensure their tasks are covered.
				</p>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
					<p style="font-size: 12px; color: #999; margin: 0;">
						This is an automated notification from PM Management System
					</p>
				</div>
			</div>
		</div>
	`;

	return await sendEmail({ to, subject, html });
}

// Send time entry missing reminder
async function sendTimeEntryMissingReminder({ to, employeeName, days }) {
	const subject = `⏰ Time Entry Missing: ${employeeName}`;
	const html = `
		<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
			<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
				<h2 style="color: #ffc107; margin-bottom: 20px;">⏰ Time Entry Missing</h2>
				<p style="font-size: 16px; line-height: 1.6;">
					<strong>${employeeName}</strong> has not logged any time entries in the past 
					<strong>${days} days</strong>.
				</p>
				<p style="font-size: 14px; color: #666; margin-top: 20px;">
					Please remind them to log their hours for accurate billing and tracking.
				</p>
				<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
					<p style="font-size: 12px; color: #999; margin: 0;">
						This is an automated notification from PM Management System
					</p>
				</div>
			</div>
		</div>
	`;

	return await sendEmail({ to, subject, html });
}

module.exports = {
	sendEmail,
	sendBudgetOverrunAlert,
	sendSprintEndingReminder,
	sendBurnoutAlert,
	sendVacationReminder,
	sendTimeEntryMissingReminder,
};

