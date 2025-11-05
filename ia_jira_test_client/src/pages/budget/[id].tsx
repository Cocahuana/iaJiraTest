'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Plus,
	Trash2,
	Save,
	Edit,
	DollarSign,
	Users as UsersIcon,
	TrendingUp,
	Calendar,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Budget {
	id: string;
	name: string;
	initial_budget: number;
	initial_investment: number;
	expected_roi: number;
	needed_personnel: number;
	personnel_budget: number;
	personnel_list: PersonnelItem[];
	status: string;
	description: string;
	start_date: string;
	end_date: string;
	createdAt: string;
	updatedAt: string;
	Project: {
		id: string;
		name: string;
		description: string;
	};
	enrichedPersonnel?: EnrichedPersonnel[];
}

interface PersonnelItem {
	userId: string;
	allocatedBudget: number;
	hourlyRate: number;
	estimatedHours: number;
}

interface EnrichedPersonnel extends PersonnelItem {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	} | null;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function BudgetDetailPage() {
	const router = useRouter();
	const { id } = router.query;

	const [budget, setBudget] = useState<Budget | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [users, setUsers] = useState<User[]>([]);

	// Edit form state
	const [formData, setFormData] = useState({
		name: "",
		initial_budget: "",
		initial_investment: "",
		expected_roi: "",
		needed_personnel: "",
		personnel_budget: "",
		description: "",
		start_date: "",
		end_date: "",
		status: "",
	});

	const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);

	useEffect(() => {
		if (id) {
			fetchBudget();
			fetchUsers();
		}
	}, [id]);

	const fetchBudget = async () => {
		try {
			setLoading(true);
			const res = await axios.get(`${API_URL}/api/budget/budgets/${id}`);
			const budgetData = res.data.budget;
			setBudget(budgetData);

			// Initialize form data
			setFormData({
				name: budgetData.name,
				initial_budget: budgetData.initial_budget.toString(),
				initial_investment: budgetData.initial_investment.toString(),
				expected_roi: budgetData.expected_roi.toString(),
				needed_personnel: budgetData.needed_personnel.toString(),
				personnel_budget: budgetData.personnel_budget.toString(),
				description: budgetData.description || "",
				start_date: budgetData.start_date ? budgetData.start_date.split("T")[0] : "",
				end_date: budgetData.end_date ? budgetData.end_date.split("T")[0] : "",
				status: budgetData.status,
			});

			setPersonnelList(budgetData.personnel_list || []);
		} catch (error: any) {
			console.error("Error fetching budget:", error?.response?.data || error.message);
			alert("Error loading budget");
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/azure/users`).catch(err => {
				console.error("Error fetching users:", err?.response?.data || err.message);
				return { data: { users: [] } };
			});
			setUsers(res.data.users || []);
		} catch (error: any) {
			console.error("Error fetching users:", error?.response?.data || error.message);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const addPersonnel = () => {
		setPersonnelList([
			...personnelList,
			{ userId: "", allocatedBudget: 0, hourlyRate: 0, estimatedHours: 0 },
		]);
	};

	const removePersonnel = (index: number) => {
		setPersonnelList(personnelList.filter((_, i) => i !== index));
	};

	const updatePersonnel = (index: number, field: keyof PersonnelItem, value: string) => {
		const updated = [...personnelList];
		if (field === "userId") {
			updated[index][field] = value;
		} else {
			updated[index][field] = parseFloat(value) || 0;
		}
		setPersonnelList(updated);
	};

	const calculateTotalPersonnelBudget = () => {
		return personnelList.reduce((sum, p) => sum + p.allocatedBudget, 0);
	};

	const handleSave = async () => {
		try {
			setSaving(true);

			const updateData = {
				...formData,
				initial_budget: parseFloat(formData.initial_budget) || 0,
				initial_investment: parseFloat(formData.initial_investment) || 0,
				expected_roi: parseFloat(formData.expected_roi) || 0,
				needed_personnel: parseInt(formData.needed_personnel) || 0,
				personnel_budget: parseFloat(formData.personnel_budget) || calculateTotalPersonnelBudget(),
				personnel_list: personnelList.filter(p => p.userId),
			};

			await axios.put(`${API_URL}/api/budget/budgets/${id}`, updateData);

			alert("Budget updated successfully!");
			setIsEditing(false);
			fetchBudget();
		} catch (error: any) {
			console.error("Error updating budget:", error?.response?.data || error.message);
			alert(`Error updating budget: ${error?.response?.data?.error || error.message}`);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this budget?")) {
			return;
		}

		try {
			await axios.delete(`${API_URL}/api/budget/budgets/${id}`);
			alert("Budget deleted successfully!");
			router.push("/budget");
		} catch (error: any) {
			console.error("Error deleting budget:", error?.response?.data || error.message);
			alert(`Error deleting budget: ${error?.response?.data?.error || error.message}`);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-500";
			case "completed":
				return "bg-blue-500";
			case "cancelled":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	if (loading) {
		return (
			<Layout>
				<div className="flex items-center justify-center h-96">
					<p>Loading budget...</p>
				</div>
			</Layout>
		);
	}

	if (!budget) {
		return (
			<Layout>
				<div className="flex items-center justify-center h-96">
					<p>Budget not found</p>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="space-y-6 max-w-5xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							onClick={() => router.push("/budget")}
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Budgets
						</Button>
						<div>
							<h1 className="text-3xl font-bold">{budget.name}</h1>
							<p className="text-muted-foreground">
								{budget.Project?.name || "Unknown Project"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge className={getStatusColor(budget.status)}>
							{budget.status}
						</Badge>
						{!isEditing ? (
							<>
								<Button onClick={() => setIsEditing(true)}>
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
								<Button variant="destructive" onClick={handleDelete}>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</Button>
							</>
						) : (
							<>
								<Button variant="outline" onClick={() => {
									setIsEditing(false);
									fetchBudget();
								}}>
									Cancel
								</Button>
								<Button onClick={handleSave} disabled={saving}>
									<Save className="h-4 w-4 mr-2" />
									{saving ? "Saving..." : "Save Changes"}
								</Button>
							</>
						)}
					</div>
				</div>

				{/* View Mode */}
				{!isEditing ? (
					<>
						{/* Financial Overview */}
						<div className="grid gap-4 md:grid-cols-3">
							<Card className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
										<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Initial Budget</p>
										<p className="text-2xl font-bold">${budget.initial_budget.toLocaleString()}</p>
									</div>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
										<TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Expected ROI</p>
										<p className="text-2xl font-bold">{budget.expected_roi}%</p>
									</div>
								</div>
							</Card>

							<Card className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
										<UsersIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Personnel Budget</p>
										<p className="text-2xl font-bold">${budget.personnel_budget.toLocaleString()}</p>
									</div>
								</div>
							</Card>
						</div>

						{/* Details */}
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">Budget Details</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Initial Investment</p>
									<p className="text-lg">${budget.initial_investment.toLocaleString()}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Needed Personnel</p>
									<p className="text-lg">{budget.needed_personnel} people</p>
								</div>
								{budget.start_date && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Start Date</p>
										<p className="text-lg">{new Date(budget.start_date).toLocaleDateString()}</p>
									</div>
								)}
								{budget.end_date && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">End Date</p>
										<p className="text-lg">{new Date(budget.end_date).toLocaleDateString()}</p>
									</div>
								)}
								{budget.description && (
									<div className="md:col-span-2">
										<p className="text-sm font-medium text-muted-foreground">Description</p>
										<p className="text-lg">{budget.description}</p>
									</div>
								)}
							</div>
						</Card>

						{/* Personnel List */}
						{budget.enrichedPersonnel && budget.enrichedPersonnel.length > 0 && (
							<Card className="p-6">
								<h2 className="text-xl font-semibold mb-4">Assigned Personnel</h2>
								<div className="space-y-3">
									{budget.enrichedPersonnel.map((person, index) => (
										<Card key={index} className="p-4">
											<div className="grid gap-4 md:grid-cols-4">
												<div>
													<p className="text-sm font-medium text-muted-foreground">Person</p>
													<p className="text-lg">{person.user?.name || "Unknown"}</p>
													<p className="text-sm text-muted-foreground">{person.user?.email}</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
													<p className="text-lg">${person.hourlyRate}/hr</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Estimated Hours</p>
													<p className="text-lg">{person.estimatedHours} hrs</p>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">Allocated Budget</p>
													<p className="text-lg font-bold">${person.allocatedBudget.toLocaleString()}</p>
												</div>
											</div>
										</Card>
									))}
								</div>
							</Card>
						)}
					</>
				) : (
					/* Edit Mode */
					<>
						{/* Basic Information */}
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">Basic Information</h2>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="block text-sm font-medium mb-2">
										Budget Name <span className="text-red-500">*</span>
									</label>
									<Input
										value={formData.name}
										onChange={(e) => handleInputChange("name", e.target.value)}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Status</label>
									<Select
										value={formData.status}
										onValueChange={(value) => handleInputChange("status", value)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
											<SelectItem value="cancelled">Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Start Date</label>
									<Input
										type="date"
										value={formData.start_date}
										onChange={(e) => handleInputChange("start_date", e.target.value)}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">End Date</label>
									<Input
										type="date"
										value={formData.end_date}
										onChange={(e) => handleInputChange("end_date", e.target.value)}
									/>
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium mb-2">Description</label>
									<Textarea
										value={formData.description}
										onChange={(e) => handleInputChange("description", e.target.value)}
										rows={3}
									/>
								</div>
							</div>
						</Card>

						{/* Financial Information */}
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">Financial Information</h2>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<label className="block text-sm font-medium mb-2">Initial Budget</label>
									<Input
										type="number"
										step="0.01"
										value={formData.initial_budget}
										onChange={(e) => handleInputChange("initial_budget", e.target.value)}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Initial Investment</label>
									<Input
										type="number"
										step="0.01"
										value={formData.initial_investment}
										onChange={(e) => handleInputChange("initial_investment", e.target.value)}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Expected ROI (%)</label>
									<Input
										type="number"
										step="0.01"
										value={formData.expected_roi}
										onChange={(e) => handleInputChange("expected_roi", e.target.value)}
									/>
								</div>
							</div>
						</Card>

						{/* Personnel Information */}
						<Card className="p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold">Personnel Budget</h2>
								<Button type="button" onClick={addPersonnel} variant="outline">
									<Plus className="h-4 w-4 mr-2" />
									Add Personnel
								</Button>
							</div>

							<div className="grid gap-4 md:grid-cols-2 mb-4">
								<div>
									<label className="block text-sm font-medium mb-2">Needed Personnel Count</label>
									<Input
										type="number"
										value={formData.needed_personnel}
										onChange={(e) => handleInputChange("needed_personnel", e.target.value)}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Total Personnel Budget</label>
									<Input
										type="number"
										step="0.01"
										value={formData.personnel_budget}
										onChange={(e) => handleInputChange("personnel_budget", e.target.value)}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Auto-calculated: ${calculateTotalPersonnelBudget().toFixed(2)}
									</p>
								</div>
							</div>

							{/* Personnel List */}
							{personnelList.length > 0 && (
								<div className="space-y-3">
									<p className="text-sm font-medium">Assigned Personnel:</p>
									{personnelList.map((person, index) => (
										<Card key={index} className="p-4">
											<div className="grid gap-4 md:grid-cols-5">
												<div className="md:col-span-2">
													<label className="block text-sm font-medium mb-2">User</label>
													<Select
														value={person.userId}
														onValueChange={(value) => updatePersonnel(index, "userId", value)}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select user" />
														</SelectTrigger>
														<SelectContent>
															{users.map((user) => (
																<SelectItem key={user.id} value={user.id}>
																	{user.name} ({user.role})
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div>
													<label className="block text-sm font-medium mb-2">Hourly Rate</label>
													<Input
														type="number"
														step="0.01"
														value={person.hourlyRate}
														onChange={(e) => updatePersonnel(index, "hourlyRate", e.target.value)}
													/>
												</div>

												<div>
													<label className="block text-sm font-medium mb-2">Est. Hours</label>
													<Input
														type="number"
														value={person.estimatedHours}
														onChange={(e) => updatePersonnel(index, "estimatedHours", e.target.value)}
													/>
												</div>

												<div>
													<label className="block text-sm font-medium mb-2">Budget</label>
													<div className="flex gap-2">
														<Input
															type="number"
															step="0.01"
															value={person.allocatedBudget}
															onChange={(e) => updatePersonnel(index, "allocatedBudget", e.target.value)}
														/>
														<Button
															type="button"
															variant="destructive"
															size="icon"
															onClick={() => removePersonnel(index)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							)}
						</Card>
					</>
				)}
			</div>
		</Layout>
	);
}

