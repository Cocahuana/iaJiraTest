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
import { 
	Users, 
	RefreshCw, 
	Search, 
	UserCheck, 
	UserPlus,
	Shield,
	Mail,
	Download
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	auth0_id: string | null;
	createdAt: string;
	updatedAt: string;
}

const ROLES = [
	{ value: "admin", label: "Admin", color: "destructive" },
	{ value: "pm", label: "Project Manager", color: "warning" },
	{ value: "employee", label: "Employee", color: "default" },
	{ value: "executive", label: "Executive", color: "secondary" },
];

export default function UsersPage() {
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [updatingRole, setUpdatingRole] = useState<string | null>(null);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_URL}/api/azure/users`);
			setUsers(res.data.users || []);
		} catch (error: any) {
			console.error("Error fetching users:", error?.response?.data || error.message);
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const syncUsersFromAzure = async () => {
		try {
			setSyncing(true);
			const res = await axios.get(`${API_URL}/api/azure/users/sync`);
			setUsers(res.data.users || []);
			alert(`Successfully synced ${res.data.count} users from Azure DevOps!`);
		} catch (error: any) {
			console.error("Error syncing users:", error?.response?.data || error.message);
			alert(`Error syncing users: ${error?.response?.data?.error || error.message}`);
		} finally {
			setSyncing(false);
		}
	};

	const updateUserRole = async (userId: string, newRole: string) => {
		try {
			setUpdatingRole(userId);
			await axios.put(`${API_URL}/api/azure/users/${userId}/role`, {
				role: newRole,
			});
			// Update local state
			setUsers(users.map(user => 
				user.id === userId ? { ...user, role: newRole } : user
			));
			alert("User role updated successfully!");
		} catch (error: any) {
			console.error("Error updating role:", error?.response?.data || error.message);
			alert(`Error updating role: ${error?.response?.data?.error || error.message}`);
		} finally {
			setUpdatingRole(null);
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			searchTerm === "" ||
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	const getRoleBadge = (role: string) => {
		const roleConfig = ROLES.find(r => r.value === role) || { label: role, color: "outline" };
		return (
			<Badge variant={roleConfig.color as any}>
				{roleConfig.label}
			</Badge>
		);
	};

	const getRoleStats = () => {
		const stats = ROLES.map(role => ({
			...role,
			count: users.filter(u => u.role === role.value).length
		}));
		return stats;
	};

	const exportToCSV = () => {
		const headers = ["Name", "Email", "Role", "Created At"];
		const rows = filteredUsers.map(user => [
			user.name,
			user.email,
			user.role,
			new Date(user.createdAt).toLocaleDateString()
		]);

		const csv = [
			headers.join(","),
			...rows.map(row => row.join(","))
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
	};

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<Users className="h-8 w-8" />
							User Management
						</h1>
						<p className="text-muted-foreground">
							Manage users synced from Azure DevOps
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={exportToCSV}
							disabled={loading || filteredUsers.length === 0}
						>
							<Download className="h-4 w-4 mr-2" />
							Export CSV
						</Button>
						<Button onClick={fetchUsers} variant="outline" disabled={loading}>
							<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
							Refresh
						</Button>
						<Button 
							onClick={syncUsersFromAzure} 
							disabled={syncing}
							className="bg-blue-600 hover:bg-blue-700"
						>
							{syncing ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Syncing...
								</>
							) : (
								<>
									<UserPlus className="h-4 w-4 mr-2" />
									Sync from Azure
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Total Users
								</p>
								<p className="text-2xl font-bold">{users.length}</p>
							</div>
							<Users className="h-8 w-8 text-blue-500" />
						</div>
					</Card>

					{getRoleStats().map((stat) => (
						<Card key={stat.value} className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{stat.label}s
									</p>
									<p className="text-2xl font-bold">{stat.count}</p>
								</div>
								<Shield className="h-8 w-8 text-purple-500" />
							</div>
						</Card>
					))}
				</div>

				{/* Filters */}
				<Card className="p-4">
					<div className="flex items-center gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={roleFilter} onValueChange={setRoleFilter}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								{ROLES.map((role) => (
									<SelectItem key={role.value} value={role.value}>
										{role.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</Card>

				{/* Users Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Auth0 Linked</TableHead>
								<TableHead>Created At</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
										<p className="text-muted-foreground">Loading users...</p>
									</TableCell>
								</TableRow>
							) : filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-12">
										<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
										<p className="text-lg font-medium mb-2">No users found</p>
										<p className="text-sm text-muted-foreground mb-4">
											{users.length === 0 
												? "Click 'Sync from Azure' to import users from Azure DevOps"
												: "Try adjusting your search or filters"
											}
										</p>
										{users.length === 0 && (
											<Button onClick={syncUsersFromAzure} disabled={syncing}>
												<UserPlus className="h-4 w-4 mr-2" />
												Sync from Azure
											</Button>
										)}
									</TableCell>
								</TableRow>
							) : (
								filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
													<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
														{user.name.charAt(0).toUpperCase()}
													</span>
												</div>
												{user.name}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												{user.email}
											</div>
										</TableCell>
										<TableCell>{getRoleBadge(user.role)}</TableCell>
										<TableCell>
											{user.auth0_id ? (
												<div className="flex items-center gap-2 text-green-600">
													<UserCheck className="h-4 w-4" />
													<span className="text-sm">Linked</span>
												</div>
											) : (
												<span className="text-sm text-muted-foreground">
													Not linked
												</span>
											)}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Select
												value={user.role}
												onValueChange={(newRole) => updateUserRole(user.id, newRole)}
												disabled={updatingRole === user.id}
											>
												<SelectTrigger className="w-[140px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{ROLES.map((role) => (
														<SelectItem key={role.value} value={role.value}>
															{role.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</Card>

				{/* Info Card */}
				<Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
					<div className="flex items-start gap-3">
						<Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
						<div>
							<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
								About User Sync
							</h3>
							<p className="text-sm text-blue-800 dark:text-blue-200">
								Users are automatically synced from Azure DevOps. Click "Sync from Azure" 
								to fetch the latest users from your organization. You can assign roles to users 
								to control their permissions in the application.
							</p>
						</div>
					</div>
				</Card>
			</div>
		</Layout>
	);
}

