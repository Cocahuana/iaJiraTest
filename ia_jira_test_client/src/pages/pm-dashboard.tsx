'use client';

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertTriangle,
	Calendar,
	DollarSign,
	Clock,
	TrendingUp,
	Users,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PMDashboard() {
	const { user } = useUser();
	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState<any>({
		budgetOverruns: [],
		sprintsEndingSoon: [],
		upcomingVacations: [],
		currentVacations: [],
		unbilledHours: 0,
		missingTimeEntries: [],
		highRiskBurnout: [],
		notifications: [],
	});

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			// Fetch all data in parallel
			const [
				budgetOverruns,
				sprintsEndingSoon,
				upcomingVacations,
				currentVacations,
				unbilledEntries,
				missingTimeEntries,
				highRiskBurnout,
				notifications,
			] = await Promise.all([
				axios.get(`${API_URL}/api/budget/overruns`).catch(err => {
					console.error("Error fetching budget overruns:", err?.response?.data || err.message);
					return { data: { overruns: [] } };
				}),
				axios.get(`${API_URL}/api/sprints/ending-soon`).catch(err => {
					console.error("Error fetching sprints ending soon:", err?.response?.data || err.message);
					return { data: { sprints: [] } };
				}),
				axios.get(`${API_URL}/api/vacations/upcoming`).catch(err => {
					console.error("Error fetching upcoming vacations:", err?.response?.data || err.message);
					return { data: { vacations: [] } };
				}),
				axios.get(`${API_URL}/api/vacations/current`).catch(err => {
					console.error("Error fetching current vacations:", err?.response?.data || err.message);
					return { data: { vacations: [] } };
				}),
				axios.get(`${API_URL}/api/timeentries/unbilled`).catch(err => {
					console.error("Error fetching unbilled entries:", err?.response?.data || err.message);
					return { data: { totalHours: 0 } };
				}),
				axios.get(`${API_URL}/api/timeentries/missing?days=7`).catch(err => {
					console.error("Error fetching missing time entries:", err?.response?.data || err.message);
					return { data: { missingUsers: [] } };
				}),
				axios.get(`${API_URL}/api/burnout/high-risk`).catch(err => {
					console.error("Error fetching high risk burnout:", err?.response?.data || err.message);
					return { data: { highRiskUsers: [] } };
				}),
				axios.get(`${API_URL}/api/notifications/user/${user?.sub}`).catch(err => {
					console.error("Error fetching notifications:", err?.response?.data || err.message);
					return { data: { notifications: [] } };
				}),
			]);

			setDashboardData({
				budgetOverruns: budgetOverruns.data.overruns || [],
				sprintsEndingSoon: sprintsEndingSoon.data.sprints || [],
				upcomingVacations: upcomingVacations.data.vacations || [],
				currentVacations: currentVacations.data.vacations || [],
				unbilledHours: unbilledEntries.data.totalHours || 0,
				missingTimeEntries: missingTimeEntries.data.missingUsers || [],
				highRiskBurnout: highRiskBurnout.data.highRiskUsers || [],
				notifications: notifications.data.notifications || [],
			});
		} catch (error: any) {
			console.error("Error fetching dashboard data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const unreadNotifications = dashboardData.notifications.filter(
		(n: any) => n.status === "unread"
	).length;

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">PM Dashboard</h1>
						<p className="text-muted-foreground">
							Overview of all projects and team metrics
						</p>
					</div>
					<Button onClick={fetchDashboardData}>Refresh</Button>
				</div>

				{/* Critical Alerts */}
				{(dashboardData.budgetOverruns.length > 0 ||
					dashboardData.highRiskBurnout.length > 0) && (
					<Card className="border-red-500 bg-red-50 dark:bg-red-950 p-4">
						<div className="flex items-start gap-3">
							<AlertTriangle className="h-6 w-6 text-red-500" />
							<div className="flex-1">
								<h3 className="font-semibold text-red-900 dark:text-red-100">
									Critical Alerts Requiring Attention
								</h3>
								<div className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
									{dashboardData.budgetOverruns.length > 0 && (
										<p>
											• {dashboardData.budgetOverruns.length}{" "}
											project(s) over budget
										</p>
									)}
									{dashboardData.highRiskBurnout.length > 0 && (
										<p>
											• {dashboardData.highRiskBurnout.length}{" "}
											team member(s) at high burnout risk
										</p>
									)}
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* KPI Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Budget Overruns
								</p>
								<p className="text-2xl font-bold text-red-500">
									{dashboardData.budgetOverruns.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Require immediate review
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-red-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Sprints Ending
								</p>
								<p className="text-2xl font-bold text-yellow-500">
									{dashboardData.sprintsEndingSoon.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Within next 7 days
								</p>
							</div>
							<Calendar className="h-8 w-8 text-yellow-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Unbilled Hours
								</p>
								<p className="text-2xl font-bold text-blue-500">
									{dashboardData.unbilledHours.toFixed(1)}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Need to be billed
								</p>
							</div>
							<Clock className="h-8 w-8 text-blue-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									High Burnout Risk
								</p>
								<p className="text-2xl font-bold text-orange-500">
									{dashboardData.highRiskBurnout.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Team members
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-orange-500" />
						</div>
					</Card>
				</div>

				{/* Two Column Layout */}
				<div className="grid gap-6 md:grid-cols-2">
					{/* Budget Overruns */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Budget Overruns</h3>
							<Badge variant="destructive">
								{dashboardData.budgetOverruns.length}
							</Badge>
						</div>
						<div className="space-y-3">
							{dashboardData.budgetOverruns.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No budget overruns 🎉
								</p>
							) : (
								dashboardData.budgetOverruns
									.slice(0, 5)
									.map((overrun: any) => (
										<div
											key={overrun.id}
											className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg"
										>
											<div className="flex-1">
												<p className="font-medium text-sm">
													{overrun.Sprint?.Project?.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{overrun.Sprint?.name} •{" "}
													{overrun.User?.name}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-red-600">
													${overrun.overrun_amount}
												</p>
												<p className="text-xs text-muted-foreground">
													over budget
												</p>
											</div>
										</div>
									))
							)}
						</div>
					</Card>

					{/* High Burnout Risk */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								High Burnout Risk
							</h3>
							<Badge variant="warning">
								{dashboardData.highRiskBurnout.length}
							</Badge>
						</div>
						<div className="space-y-3">
							{dashboardData.highRiskBurnout.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									All team members healthy 💪
								</p>
							) : (
								dashboardData.highRiskBurnout
									.slice(0, 5)
									.map((metric: any) => (
										<div
											key={metric.id}
											className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg"
										>
											<div className="flex-1">
												<p className="font-medium text-sm">
													{metric.User?.name}
												</p>
												<p className="text-xs text-muted-foreground">
													Stress Level: {metric.stress_level}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-orange-600">
													{metric.burnout_score}/100
												</p>
												<p className="text-xs text-muted-foreground">
													burnout score
												</p>
											</div>
										</div>
									))
							)}
						</div>
					</Card>

					{/* Sprints Ending Soon */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								Sprints Ending Soon
							</h3>
							<Badge variant="warning">
								{dashboardData.sprintsEndingSoon.length}
							</Badge>
						</div>
						<div className="space-y-3">
							{dashboardData.sprintsEndingSoon.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No sprints ending soon
								</p>
							) : (
								dashboardData.sprintsEndingSoon.map(
									(sprint: any) => {
										const daysLeft = Math.ceil(
											(new Date(sprint.end_date).getTime() -
												new Date().getTime()) /
												(1000 * 60 * 60 * 24)
										);
										return (
											<div
												key={sprint.id}
												className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg"
											>
												<div className="flex-1">
													<p className="font-medium text-sm">
														{sprint.name}
													</p>
													<p className="text-xs text-muted-foreground">
														{sprint.Project?.name}
													</p>
												</div>
												<div className="text-right">
													<p className="font-bold text-yellow-600">
														{daysLeft} days
													</p>
													<p className="text-xs text-muted-foreground">
														remaining
													</p>
												</div>
											</div>
										);
									}
								)
							)}
						</div>
					</Card>

					{/* Vacations */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								Team Availability
							</h3>
							<Badge>
								{dashboardData.currentVacations.length} out today
							</Badge>
						</div>
						<div className="space-y-3">
							{dashboardData.currentVacations.length === 0 ? (
								<p className="text-sm text-muted-foreground mb-4">
									Everyone is available today ✓
								</p>
							) : (
								<div className="mb-4">
									<p className="text-sm font-medium mb-2">
										Currently on vacation:
									</p>
									{dashboardData.currentVacations.map(
										(vacation: any) => (
											<div
												key={vacation.id}
												className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded"
											>
												<Users className="h-4 w-4 text-blue-500" />
												<span className="text-sm">
													{vacation.User?.name}
												</span>
											</div>
										)
									)}
								</div>
							)}
							{dashboardData.upcomingVacations.length > 0 && (
								<div>
									<p className="text-sm font-medium mb-2">
										Upcoming vacations (next 30 days):
									</p>
									{dashboardData.upcomingVacations
										.slice(0, 3)
										.map((vacation: any) => (
											<div
												key={vacation.id}
												className="text-sm text-muted-foreground p-2"
											>
												{vacation.User?.name} •{" "}
												{new Date(
													vacation.start_date
												).toLocaleDateString()}
											</div>
										))}
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Missing Time Entries */}
				{dashboardData.missingTimeEntries.length > 0 && (
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">
								Missing Time Entries (Last 7 Days)
							</h3>
							<Badge variant="warning">
								{dashboardData.missingTimeEntries.length}
							</Badge>
						</div>
						<div className="flex flex-wrap gap-2">
							{dashboardData.missingTimeEntries.map((user: any) => (
								<Badge key={user.id} variant="outline">
									{user.name}
								</Badge>
							))}
						</div>
					</Card>
				)}

				{/* Quick Actions */}
				<Card className="p-6">
					<h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
						<Button
							variant="outline"
							className="justify-start"
							onClick={() => (window.location.href = "/vacations")}
						>
							<Calendar className="h-4 w-4 mr-2" />
							Manage Vacations
						</Button>
						<Button
							variant="outline"
							className="justify-start"
							onClick={() => (window.location.href = "/budget")}
						>
							<DollarSign className="h-4 w-4 mr-2" />
							View Budget
						</Button>
						<Button
							variant="outline"
							className="justify-start"
							onClick={() => (window.location.href = "/timetracking")}
						>
							<Clock className="h-4 w-4 mr-2" />
							Time Tracking
						</Button>
						<Button
							variant="outline"
							className="justify-start"
							onClick={() => (window.location.href = "/notifications")}
						>
							<AlertCircle className="h-4 w-4 mr-2" />
							Notifications
							{unreadNotifications > 0 && (
								<Badge variant="destructive" className="ml-2">
									{unreadNotifications}
								</Badge>
							)}
						</Button>
					</div>
				</Card>
			</div>
		</Layout>
	);
}

