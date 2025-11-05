"use client";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, User, CheckCircle, AlertCircle, Clock } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TaskStatusPage() {
	const [loading, setLoading] = useState(true);
	const [tasks, setTasks] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [vacations, setVacations] = useState<any[]>([]);
	const [selectedUser, setSelectedUser] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [tasksRes, usersRes, vacationsRes] = await Promise.all([
				axios.get(`${API_URL}/api/azure/tasks`).catch(err => {
					console.error("Error fetching tasks:", err?.response?.data || err.message);
					return { data: { tasks: [] } };
				}),
				axios.get(`${API_URL}/api/azure/users/sync`).catch(err => {
					console.error("Error fetching users:", err?.response?.data || err.message);
					return { data: { users: [] } };
				}),
				axios.get(`${API_URL}/api/vacations/current`).catch(err => {
					console.error("Error fetching vacations:", err?.response?.data || err.message);
					return { data: { vacations: [] } };
				}),
			]);

			setTasks(tasksRes.data.tasks || []);
			setUsers(usersRes.data.users || []);
			setVacations(vacationsRes.data.vacations || []);
		} catch (error: any) {
			console.error("Error fetching data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const isUserOnVacation = (userId: string) => {
		return vacations.some((v) => v.user_id === userId);
	};

	const getUserVacation = (userId: string) => {
		return vacations.find((v) => v.user_id === userId);
	};

	const filteredTasks = tasks.filter((task) => {
		const matchesUser =
			selectedUser === "all" || task.assignee_id === selectedUser;
		const matchesSearch =
			searchTerm === "" ||
			task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			task.description?.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesUser && matchesSearch;
	});

	const usersOnVacation = users.filter((user) => isUserOnVacation(user.id));
	const tasksOfAbsentUsers = tasks.filter((task) =>
		isUserOnVacation(task.assignee_id)
	);

	const getStatusBadge = (status: string) => {
		const statusMap: any = {
			todo: { variant: "secondary", label: "To Do" },
			in_progress: { variant: "default", label: "In Progress" },
			completed: { variant: "success", label: "Completed" },
			blocked: { variant: "destructive", label: "Blocked" },
			new: { variant: "secondary", label: "New" },
			active: { variant: "default", label: "Active" },
			resolved: { variant: "success", label: "Resolved" },
			closed: { variant: "success", label: "Closed" },
		};

		const statusInfo = statusMap[status?.toLowerCase()] || {
			variant: "outline",
			label: status || "Unknown",
		};

		return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>;
	};

	const getPriorityBadge = (priority: string) => {
		const priorityMap: any = {
			high: "destructive",
			medium: "warning",
			low: "secondary",
		};

		return (
			<Badge variant={priorityMap[priority?.toLowerCase()] || "outline"}>
				{priority || "None"}
			</Badge>
		);
	};

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Task Status Dashboard</h1>
						<p className="text-muted-foreground">
							Track tasks of absent team members
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
									Total Tasks
								</p>
								<p className="text-2xl font-bold">{tasks.length}</p>
								<p className="text-xs text-muted-foreground mt-1">
									All active tasks
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-blue-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									On Vacation
								</p>
								<p className="text-2xl font-bold text-orange-500">
									{usersOnVacation.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Team members
								</p>
							</div>
							<User className="h-8 w-8 text-orange-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Unattended Tasks
								</p>
								<p className="text-2xl font-bold text-red-500">
									{tasksOfAbsentUsers.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									From absent users
								</p>
							</div>
							<AlertCircle className="h-8 w-8 text-red-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									In Progress
								</p>
								<p className="text-2xl font-bold text-yellow-500">
									{
										tasks.filter(
											(t) => t.state?.toLowerCase() === "in_progress"
										).length
									}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Active tasks
								</p>
							</div>
							<Clock className="h-8 w-8 text-yellow-500" />
						</div>
					</Card>
				</div>

				{/* Absent Users Alert */}
				{usersOnVacation.length > 0 && (
					<Card className="border-orange-500 bg-orange-50 dark:bg-orange-950 p-4">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
							<div className="flex-1">
								<h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
									Team Members Currently on Vacation
								</h3>
								<div className="flex flex-wrap gap-2">
									{usersOnVacation.map((user) => {
										const vacation = getUserVacation(user.id);
										return (
											<div
												key={user.id}
												className="bg-white dark:bg-gray-900 p-3 rounded-lg"
											>
												<p className="font-medium text-sm">
													{user.name}
												</p>
												{vacation && (
													<p className="text-xs text-muted-foreground">
														Until{" "}
														{format(
															new Date(vacation.end_date),
															"MMM dd"
														)}
													</p>
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Filters */}
				<Card className="p-4">
					<div className="flex items-center gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search tasks..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={selectedUser} onValueChange={setSelectedUser}>
							<SelectTrigger className="w-[250px]">
								<SelectValue placeholder="Filter by user" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Users</SelectItem>
								<SelectItem value="vacation">
									On Vacation Only
								</SelectItem>
								{users.map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.name}
										{isUserOnVacation(user.id) && " 🏖️"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</Card>

				{/* Tasks Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Task</TableHead>
								<TableHead>Assignee</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Project</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center">
										Loading...
									</TableCell>
								</TableRow>
							) : filteredTasks.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center">
										No tasks found
									</TableCell>
								</TableRow>
							) : (
								filteredTasks.map((task) => {
									const assigneeOnVacation = isUserOnVacation(
										task.assignee_id
									);
									const assignee = users.find(
										(u) => u.id === task.assignee_id
									);
									
									// Use Azure assignedTo if available, otherwise lookup from users
									const assigneeName = task.assignedTo || 
										task.User?.name || 
										assignee?.name || 
										"Unassigned";

									return (
										<TableRow
											key={task.id}
											className={
												assigneeOnVacation
													? "bg-orange-50 dark:bg-orange-950"
													: ""
											}
										>
											<TableCell className="font-medium max-w-xs">
												<div>
													<p className="truncate">{task.title}</p>
													{task.description && (
														<p className="text-xs text-muted-foreground truncate">
															{task.description}
														</p>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													{assigneeName}
													{assigneeOnVacation && (
														<Badge variant="warning" className="text-xs">
															On Vacation
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												{getStatusBadge(task.state)}
											</TableCell>
											<TableCell>
												{getPriorityBadge(task.priority)}
											</TableCell>
											<TableCell>
												{task.due_date
													? format(
															new Date(task.due_date),
															"MMM dd, yyyy"
													  )
													: "-"}
											</TableCell>
											<TableCell>{task.Project?.name || "-"}</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button variant="outline" size="sm">
														View
													</Button>
													{assigneeOnVacation && (
														<Button variant="outline" size="sm">
															Reassign
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</Card>
			</div>
		</Layout>
	);
}

