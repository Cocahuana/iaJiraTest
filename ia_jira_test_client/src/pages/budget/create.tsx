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
import { ArrowLeft, Plus, Trash2, Save, DollarSign } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Project {
	id: string;
	name: string;
	description: string;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface PersonnelItem {
	userId: string;
	allocatedBudget: number;
	hourlyRate: number;
	estimatedHours: number;
}

export default function CreateBudgetPage() {
	const router = useRouter();
	const { projectId } = router.query;

	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	// Form state
	const [formData, setFormData] = useState({
		project_id: (projectId as string) || "",
		name: "",
		initial_budget: "",
		initial_investment: "",
		expected_roi: "",
		needed_personnel: "",
		personnel_budget: "",
		description: "",
		start_date: "",
		end_date: "",
	});

	const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);

	useEffect(() => {
		fetchProjects();
		fetchUsers();
	}, []);

	useEffect(() => {
		if (projectId) {
			setFormData(prev => ({ ...prev, project_id: projectId as string }));
		}
	}, [projectId]);

	const fetchProjects = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/azure/projects/sync`).catch(err => {
				console.error("Error fetching projects:", err?.response?.data || err.message);
				return { data: { projects: [] } };
			});
			setProjects(res.data.projects || []);
		} catch (error: any) {
			console.error("Error fetching projects:", error?.response?.data || error.message);
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!formData.project_id || !formData.name || !formData.initial_budget) {
			alert("Please fill in all required fields: Project, Name, and Initial Budget");
			return;
		}

		try {
			setLoading(true);

			const budgetData = {
				...formData,
				initial_budget: parseFloat(formData.initial_budget) || 0,
				initial_investment: parseFloat(formData.initial_investment) || 0,
				expected_roi: parseFloat(formData.expected_roi) || 0,
				needed_personnel: parseInt(formData.needed_personnel) || 0,
				personnel_budget: parseFloat(formData.personnel_budget) || calculateTotalPersonnelBudget(),
				personnel_list: personnelList.filter(p => p.userId),
			};

			const res = await axios.post(`${API_URL}/api/budget/budgets`, budgetData);

			alert("Budget created successfully!");
			router.push(`/budget/${res.data.budget.id}`);
		} catch (error: any) {
			console.error("Error creating budget:", error?.response?.data || error.message);
			alert(`Error creating budget: ${error?.response?.data?.error || error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Layout>
			<div className="space-y-6 max-w-5xl mx-auto">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						onClick={() => router.back()}
						disabled={loading}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Create New Budget</h1>
						<p className="text-muted-foreground">
							Define budget parameters and assign personnel
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Information */}
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Basic Information</h2>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="block text-sm font-medium mb-2">
									Project <span className="text-red-500">*</span>
								</label>
								<Select
									value={formData.project_id}
									onValueChange={(value) => handleInputChange("project_id", value)}
									disabled={!!projectId}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select project" />
									</SelectTrigger>
									<SelectContent>
										{projects.map((project) => (
											<SelectItem key={project.id} value={project.id}>
												{project.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Budget Name <span className="text-red-500">*</span>
								</label>
								<Input
									value={formData.name}
									onChange={(e) => handleInputChange("name", e.target.value)}
									placeholder="e.g., Q1 2024 Budget"
									required
								/>
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
									placeholder="Budget description and notes..."
									rows={3}
								/>
							</div>
						</div>
					</Card>

					{/* Financial Information */}
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<DollarSign className="h-5 w-5" />
							Financial Information
						</h2>
						<div className="grid gap-4 md:grid-cols-3">
							<div>
								<label className="block text-sm font-medium mb-2">
									Initial Budget <span className="text-red-500">*</span>
								</label>
								<Input
									type="number"
									step="0.01"
									value={formData.initial_budget}
									onChange={(e) => handleInputChange("initial_budget", e.target.value)}
									placeholder="0.00"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Initial Investment
								</label>
								<Input
									type="number"
									step="0.01"
									value={formData.initial_investment}
									onChange={(e) => handleInputChange("initial_investment", e.target.value)}
									placeholder="0.00"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Expected ROI (%)
								</label>
								<Input
									type="number"
									step="0.01"
									value={formData.expected_roi}
									onChange={(e) => handleInputChange("expected_roi", e.target.value)}
									placeholder="0.00"
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
								<label className="block text-sm font-medium mb-2">
									Needed Personnel Count
								</label>
								<Input
									type="number"
									value={formData.needed_personnel}
									onChange={(e) => handleInputChange("needed_personnel", e.target.value)}
									placeholder="0"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Total Personnel Budget
								</label>
								<Input
									type="number"
									step="0.01"
									value={formData.personnel_budget || calculateTotalPersonnelBudget()}
									onChange={(e) => handleInputChange("personnel_budget", e.target.value)}
									placeholder={calculateTotalPersonnelBudget().toFixed(2)}
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
													placeholder="0.00"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium mb-2">Est. Hours</label>
												<Input
													type="number"
													value={person.estimatedHours}
													onChange={(e) => updatePersonnel(index, "estimatedHours", e.target.value)}
													placeholder="0"
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
														placeholder="0.00"
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

					{/* Actions */}
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							<Save className="h-4 w-4 mr-2" />
							{loading ? "Creating..." : "Create Budget"}
						</Button>
					</div>
				</form>
			</div>
		</Layout>
	);
}

