'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Calendar,
	TrendingUp,
	Target,
	Clock,
	CheckCircle,
	PlayCircle,
	CalendarClock,
	DollarSign,
	ArrowRight,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Sprint {
	id: string;
	name: string;
	azure_id: string;
	start_date: string;
	end_date: string;
	status: string;
	budget: number;
	velocity: number;
	completed_points: number;
	project_id: string;
	Project?: {
		id: string;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
}

interface Project {
	id: string;
	name: string;
	description: string;
}

export default function SprintsPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [sprints, setSprints] = useState<Sprint[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProject, setSelectedProject] = useState<string>("all");

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (selectedProject !== "all") {
			fetchSprintsByProject(selectedProject);
		} else {
			fetchAllSprints();
		}
	}, [selectedProject]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [sprintsRes, projectsRes] = await Promise.all([
				axios.get(`${API_URL}/api/sprints`).catch(err => {
					console.error("Error fetching sprints:", err?.response?.data || err.message);
					return { data: { sprints: [] } };
				}),
				axios.get(`${API_URL}/api/azure/projects/sync`).catch(err => {
					console.error("Error fetching projects:", err?.response?.data || err.message);
					return { data: { projects: [] } };
				}),
			]);

			setSprints(sprintsRes.data.sprints || []);
			setProjects(projectsRes.data.projects || []);
		} catch (error: any) {
			console.error("Error fetching data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchAllSprints = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/sprints`).catch(err => {
				console.error("Error fetching sprints:", err?.response?.data || err.message);
				return { data: { sprints: [] } };
			});
			setSprints(res.data.sprints || []);
		} catch (error: any) {
			console.error("Error fetching sprints:", error?.response?.data || error.message);
		}
	};

	const fetchSprintsByProject = async (projectId: string) => {
		try {
			const res = await axios.get(`${API_URL}/api/sprints/project/${projectId}`).catch(err => {
				console.error("Error fetching project sprints:", err?.response?.data || err.message);
				return { data: { sprints: [] } };
			});
			setSprints(res.data.sprints || []);
		} catch (error: any) {
			console.error("Error fetching project sprints:", error?.response?.data || error.message);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-500";
			case "completed":
				return "bg-blue-500";
			case "planned":
				return "bg-orange-500";
			default:
				return "bg-gray-500";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return <PlayCircle className="h-4 w-4" />;
			case "completed":
				return <CheckCircle className="h-4 w-4" />;
			case "planned":
				return <CalendarClock className="h-4 w-4" />;
			default:
				return <Clock className="h-4 w-4" />;
		}
	};

	const getDaysRemaining = (endDate: string) => {
		const end = new Date(endDate);
		const today = new Date();
		const diffTime = end.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const getDuration = (startDate: string, endDate: string) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffTime = end.getTime() - start.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Categorize sprints
	const currentSprints = sprints.filter(s => s.status?.toLowerCase() === "active");
	const pastSprints = sprints.filter(s => s.status?.toLowerCase() === "completed");
	const plannedSprints = sprints.filter(s => s.status?.toLowerCase() === "planned");

	// Calculate stats
	const totalCompleted = pastSprints.length;
	const totalVelocity = pastSprints.reduce((sum, s) => sum + (s.completed_points || 0), 0);
	const avgVelocity = totalCompleted > 0 ? Math.round(totalVelocity / totalCompleted) : 0;
	const totalBudget = sprints.reduce((sum, s) => sum + (parseFloat(s.budget?.toString() || "0") || 0), 0);

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Sprint Management</h1>
						<p className="text-muted-foreground">
							Track current and historical sprint performance
						</p>
					</div>
					<Button onClick={fetchData}>Refresh</Button>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Active Sprints
								</p>
								<p className="text-2xl font-bold">{currentSprints.length}</p>
								<p className="text-xs text-muted-foreground mt-1">
									Currently running
								</p>
							</div>
							<PlayCircle className="h-8 w-8 text-green-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Completed Sprints
								</p>
								<p className="text-2xl font-bold">{totalCompleted}</p>
								<p className="text-xs text-muted-foreground mt-1">
									Total finished
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-blue-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Avg Velocity
								</p>
								<p className="text-2xl font-bold">{avgVelocity}</p>
								<p className="text-xs text-muted-foreground mt-1">
									Story points/sprint
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-purple-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Total Budget
								</p>
								<p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
								<p className="text-xs text-muted-foreground mt-1">
									Across all sprints
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-orange-500" />
						</div>
					</Card>
				</div>

				{/* Project Filter */}
				<Card className="p-4">
					<div className="flex items-center gap-4">
						<p className="text-sm font-medium">Filter by Project:</p>
						<Select
							value={selectedProject}
							onValueChange={setSelectedProject}
						>
							<SelectTrigger className="w-[250px]">
								<SelectValue placeholder="Select a project" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Projects</SelectItem>
								{projects.map((project) => (
									<SelectItem key={project.id} value={project.id}>
										{project.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</Card>

				{/* Current Sprints */}
				{currentSprints.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<PlayCircle className="h-5 w-5 text-green-500" />
							<h2 className="text-2xl font-semibold">Current Sprint{currentSprints.length > 1 ? 's' : ''}</h2>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							{currentSprints.map((sprint) => {
								const daysRemaining = getDaysRemaining(sprint.end_date);
								const duration = getDuration(sprint.start_date, sprint.end_date);
								const progress = duration > 0 ? Math.max(0, Math.min(100, ((duration - daysRemaining) / duration) * 100)) : 0;

								return (
									<Card key={sprint.id} className="p-6 border-2 border-green-200 dark:border-green-900">
										<div className="space-y-4">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="text-xl font-semibold">{sprint.name}</h3>
													<p className="text-sm text-muted-foreground">
														{sprint.Project?.name || "No Project"}
													</p>
												</div>
												<Badge className={getStatusColor(sprint.status)}>
													{getStatusIcon(sprint.status)}
													<span className="ml-1">{sprint.status}</span>
												</Badge>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<p className="text-xs text-muted-foreground flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														Start Date
													</p>
													<p className="text-sm font-medium">{formatDate(sprint.start_date)}</p>
												</div>
												<div>
													<p className="text-xs text-muted-foreground flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														End Date
													</p>
													<p className="text-sm font-medium">{formatDate(sprint.end_date)}</p>
												</div>
											</div>

											<div className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Progress</span>
													<span className="font-medium">
														{daysRemaining > 0 ? `${daysRemaining} days left` : "Ending today"}
													</span>
												</div>
												<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
													<div
														className="bg-green-500 h-2 rounded-full transition-all"
														style={{ width: `${progress}%` }}
													/>
												</div>
											</div>

											<div className="grid grid-cols-3 gap-4 pt-2 border-t">
												{sprint.budget && (
													<div>
														<p className="text-xs text-muted-foreground">Budget</p>
														<p className="text-sm font-medium">${parseFloat(sprint.budget.toString()).toLocaleString()}</p>
													</div>
												)}
												{sprint.velocity && (
													<div>
														<p className="text-xs text-muted-foreground">Velocity</p>
														<p className="text-sm font-medium">{sprint.velocity} pts</p>
													</div>
												)}
												{sprint.completed_points !== undefined && (
													<div>
														<p className="text-xs text-muted-foreground">Completed</p>
														<p className="text-sm font-medium">{sprint.completed_points} pts</p>
													</div>
												)}
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</div>
				)}

				{/* Planned Sprints */}
				{plannedSprints.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<CalendarClock className="h-5 w-5 text-orange-500" />
							<h2 className="text-2xl font-semibold">Planned Sprints</h2>
						</div>

						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Sprint Name</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Start Date</TableHead>
										<TableHead>End Date</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Budget</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{plannedSprints.map((sprint) => (
										<TableRow key={sprint.id}>
											<TableCell className="font-medium">{sprint.name}</TableCell>
											<TableCell>{sprint.Project?.name || "N/A"}</TableCell>
											<TableCell>{formatDate(sprint.start_date)}</TableCell>
											<TableCell>{formatDate(sprint.end_date)}</TableCell>
											<TableCell>
												{getDuration(sprint.start_date, sprint.end_date)} days
											</TableCell>
											<TableCell>
												{sprint.budget ? `$${parseFloat(sprint.budget.toString()).toLocaleString()}` : "N/A"}
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(sprint.status)}>
													{getStatusIcon(sprint.status)}
													<span className="ml-1">{sprint.status}</span>
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
					</div>
				)}

				{/* Past Sprints */}
				{pastSprints.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-5 w-5 text-blue-500" />
							<h2 className="text-2xl font-semibold">Past Sprints</h2>
						</div>

						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Sprint Name</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Start Date</TableHead>
										<TableHead>End Date</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Velocity</TableHead>
										<TableHead>Completed</TableHead>
										<TableHead>Budget</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pastSprints.map((sprint) => (
										<TableRow key={sprint.id}>
											<TableCell className="font-medium">{sprint.name}</TableCell>
											<TableCell>{sprint.Project?.name || "N/A"}</TableCell>
											<TableCell>{formatDate(sprint.start_date)}</TableCell>
											<TableCell>{formatDate(sprint.end_date)}</TableCell>
											<TableCell>
												{getDuration(sprint.start_date, sprint.end_date)} days
											</TableCell>
											<TableCell>
												{sprint.velocity ? (
													<div className="flex items-center gap-1">
														<Target className="h-3 w-3 text-purple-500" />
														{sprint.velocity} pts
													</div>
												) : "N/A"}
											</TableCell>
											<TableCell>
												{sprint.completed_points !== undefined ? (
													<Badge variant="outline" className="bg-blue-50 text-blue-700">
														{sprint.completed_points} pts
													</Badge>
												) : "N/A"}
											</TableCell>
											<TableCell>
												{sprint.budget ? `$${parseFloat(sprint.budget.toString()).toLocaleString()}` : "N/A"}
											</TableCell>
											<TableCell>
												<Badge className={getStatusColor(sprint.status)}>
													{getStatusIcon(sprint.status)}
													<span className="ml-1">{sprint.status}</span>
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
					</div>
				)}

				{/* No Sprints Message */}
				{sprints.length === 0 && !loading && (
					<Card className="p-12 text-center">
						<Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No Sprints Found</h3>
						<p className="text-muted-foreground">
							{selectedProject !== "all"
								? "No sprints found for this project."
								: "No sprints have been created yet."}
						</p>
					</Card>
				)}
			</div>
		</Layout>
	);
}

