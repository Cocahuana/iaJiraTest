'use client';

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
import { Calendar, Users, Plus, Filter } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VacationsPage() {
	const [vacations, setVacations] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all"); // all, upcoming, current
	const [selectedUser, setSelectedUser] = useState<string>("all");

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [vacationsRes, usersRes] = await Promise.all([
				axios.get(`${API_URL}/api/vacations`).catch(err => {
					console.error("Error fetching vacations:", err?.response?.data || err.message);
					return { data: { vacations: [] } };
				}),
				axios.get(`${API_URL}/api/azure/users/sync`).catch(err => {
					console.error("Error fetching users:", err?.response?.data || err.message);
					return { data: { users: [] } };
				}),
			]);

			setVacations(vacationsRes.data.vacations || []);
			setUsers(usersRes.data.users || []);
		} catch (error: any) {
			console.error("Error fetching data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const filteredVacations = vacations.filter((vacation) => {
		const today = new Date();
		const startDate = new Date(vacation.start_date);
		const endDate = new Date(vacation.end_date);

		let matchesFilter = true;
		if (filter === "upcoming") {
			matchesFilter = startDate > today;
		} else if (filter === "current") {
			matchesFilter = startDate <= today && endDate >= today;
		}

		let matchesUser = true;
		if (selectedUser !== "all") {
			matchesUser = vacation.user_id === selectedUser;
		}

		return matchesFilter && matchesUser;
	});

	const getStatusBadge = (vacation: any) => {
		const today = new Date();
		const startDate = new Date(vacation.start_date);
		const endDate = new Date(vacation.end_date);

		if (endDate < today) {
			return <Badge variant="secondary">Completed</Badge>;
		} else if (startDate <= today && endDate >= today) {
			return <Badge variant="success">Active</Badge>;
		} else {
			return <Badge variant="outline">Upcoming</Badge>;
		}
	};

	const getTypeBadge = (type: string) => {
		const colors: any = {
			vacation: "default",
			sick_leave: "warning",
			personal: "secondary",
		};
		return <Badge variant={colors[type] || "outline"}>{type}</Badge>;
	};

	const getDaysLeft = (startDate: string) => {
		const today = new Date();
		const start = new Date(startDate);
		const diffTime = start.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Vacation Tracker</h1>
						<p className="text-muted-foreground">
							Manage team vacations and time off
						</p>
					</div>
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Vacation
					</Button>
				</div>

				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="p-4">
						<div className="flex items-center gap-3">
							<Users className="h-8 w-8 text-blue-500" />
							<div>
								<p className="text-sm text-muted-foreground">
									Total Vacations
								</p>
								<p className="text-2xl font-bold">
									{vacations.length}
								</p>
							</div>
						</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-3">
							<Calendar className="h-8 w-8 text-green-500" />
							<div>
								<p className="text-sm text-muted-foreground">
									Currently Out
								</p>
								<p className="text-2xl font-bold">
									{
										vacations.filter((v) => {
											const today = new Date();
											return (
												new Date(v.start_date) <= today &&
												new Date(v.end_date) >= today
											);
										}).length
									}
								</p>
							</div>
						</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-3">
							<Calendar className="h-8 w-8 text-yellow-500" />
							<div>
								<p className="text-sm text-muted-foreground">
									Upcoming (30d)
								</p>
								<p className="text-2xl font-bold">
									{
										vacations.filter((v) => {
											const today = new Date();
											const thirtyDays = new Date();
											thirtyDays.setDate(today.getDate() + 30);
											const startDate = new Date(v.start_date);
											return (
												startDate > today && startDate <= thirtyDays
											);
										}).length
									}
								</p>
							</div>
						</div>
					</Card>
					<Card className="p-4">
						<div className="flex items-center gap-3">
							<Calendar className="h-8 w-8 text-purple-500" />
							<div>
								<p className="text-sm text-muted-foreground">
									This Month
								</p>
								<p className="text-2xl font-bold">
									{
										vacations.filter((v) => {
											const today = new Date();
											const startDate = new Date(v.start_date);
											return (
												startDate.getMonth() === today.getMonth() &&
												startDate.getFullYear() ===
													today.getFullYear()
											);
										}).length
									}
								</p>
							</div>
						</div>
					</Card>
				</div>

				{/* Filters */}
				<Card className="p-4">
					<div className="flex items-center gap-4">
						<Filter className="h-5 w-5 text-muted-foreground" />
						<div className="flex-1 flex gap-4">
							<Select value={filter} onValueChange={setFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Vacations</SelectItem>
									<SelectItem value="current">
										Currently Out
									</SelectItem>
									<SelectItem value="upcoming">Upcoming</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={selectedUser}
								onValueChange={setSelectedUser}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by user" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Users</SelectItem>
									{users.map((user) => (
										<SelectItem key={user.id} value={user.id}>
											{user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button variant="outline" onClick={fetchData}>
							Refresh
						</Button>
					</div>
				</Card>

				{/* Vacations Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Employee</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Start Date</TableHead>
								<TableHead>End Date</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Days Until</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										Loading...
									</TableCell>
								</TableRow>
							) : filteredVacations.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center">
										No vacations found
									</TableCell>
								</TableRow>
							) : (
								filteredVacations.map((vacation) => {
									const startDate = new Date(vacation.start_date);
									const endDate = new Date(vacation.end_date);
									const duration = Math.ceil(
										(endDate.getTime() - startDate.getTime()) /
											(1000 * 60 * 60 * 24)
									);
									const daysUntil = getDaysLeft(vacation.start_date);

									return (
										<TableRow key={vacation.id}>
											<TableCell className="font-medium">
												{vacation.User?.name || "Unknown"}
											</TableCell>
											<TableCell>
												{getTypeBadge(vacation.type)}
											</TableCell>
											<TableCell>
												{format(startDate, "MMM dd, yyyy")}
											</TableCell>
											<TableCell>
												{format(endDate, "MMM dd, yyyy")}
											</TableCell>
											<TableCell>{duration} days</TableCell>
											<TableCell>
												{getStatusBadge(vacation)}
											</TableCell>
											<TableCell>
												{daysUntil > 0 ? (
													<span className="text-sm">
														{daysUntil} days
													</span>
												) : daysUntil === 0 ? (
													<span className="text-sm font-medium text-green-600">
														Today
													</span>
												) : (
													<span className="text-sm text-muted-foreground">
														-
													</span>
												)}
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button variant="outline" size="sm">
														Edit
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="text-red-600"
													>
														Delete
													</Button>
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

