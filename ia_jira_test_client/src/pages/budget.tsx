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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	CheckCircle,
	BarChart3,
	Plus,
	Eye,
	FileText,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function BudgetPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState<any[]>([]);
	const [selectedProject, setSelectedProject] = useState<string>("all");
	const [allCosts, setAllCosts] = useState<any[]>([]);
	const [overruns, setOverruns] = useState<any[]>([]);
	const [budgets, setBudgets] = useState<any[]>([]);
	const [aiAnalysis, setAiAnalysis] = useState<any>(null);
	const [analyzingSprintId, setAnalyzingSprintId] = useState<string | null>(
		null
	);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (selectedProject !== "all") {
			fetchBudgetsByProject(selectedProject);
		} else {
			fetchAllBudgets();
		}
	}, [selectedProject]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [projectsRes, costsRes, overrunsRes, budgetsRes] = await Promise.all([
				axios.get(`${API_URL}/api/azure/projects/sync`).catch(err => {
					console.error("Error fetching projects:", err?.response?.data || err.message);
					return { data: { projects: [] } };
				}),
				axios.get(`${API_URL}/api/budget/costs`).catch(err => {
					console.error("Error fetching costs:", err?.response?.data || err.message);
					return { data: { costs: [] } };
				}),
				axios.get(`${API_URL}/api/budget/overruns`).catch(err => {
					console.error("Error fetching overruns:", err?.response?.data || err.message);
					return { data: { overruns: [] } };
				}),
				axios.get(`${API_URL}/api/budget/budgets`).catch(err => {
					console.error("Error fetching budgets:", err?.response?.data || err.message);
					return { data: { budgets: [] } };
				}),
			]);

			setProjects(projectsRes.data.projects || []);
			setAllCosts(costsRes.data.costs || []);
			setOverruns(overrunsRes.data.overruns || []);
			setBudgets(budgetsRes.data.budgets || []);
		} catch (error: any) {
			console.error("Error fetching data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchAllBudgets = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/budget/budgets`).catch(err => {
				console.error("Error fetching budgets:", err?.response?.data || err.message);
				return { data: { budgets: [] } };
			});
			setBudgets(res.data.budgets || []);
		} catch (error: any) {
			console.error("Error fetching budgets:", error?.response?.data || error.message);
		}
	};

	const fetchBudgetsByProject = async (projectId: string) => {
		try {
			const res = await axios.get(`${API_URL}/api/budget/budgets/project/${projectId}`).catch(err => {
				console.error("Error fetching project budgets:", err?.response?.data || err.message);
				return { data: { budgets: [] } };
			});
			setBudgets(res.data.budgets || []);
		} catch (error: any) {
			console.error("Error fetching project budgets:", error?.response?.data || error.message);
		}
	};

	const analyzeOverrun = async (sprintId: string) => {
		try {
			setAnalyzingSprintId(sprintId);
			const res = await axios.get(`${API_URL}/api/budget/analyze/${sprintId}`);
			setAiAnalysis(res.data);
		} catch (error: any) {
			console.error("Error analyzing overrun:", error?.response?.data || error.message);
		} finally {
			setAnalyzingSprintId(null);
		}
	};

	const calculateTotals = (costs: any[]) => {
		return costs.reduce(
			(acc, cost) => {
				acc.allocated += parseFloat(cost.allocated_budget) || 0;
				acc.expected += parseFloat(cost.expected_cost) || 0;
				acc.actual += parseFloat(cost.actual_cost) || 0;
				acc.overrun += parseFloat(cost.overrun_amount) || 0;
				return acc;
			},
			{ allocated: 0, expected: 0, actual: 0, overrun: 0 }
		);
	};

	const filteredCosts =
		selectedProject === "all"
			? allCosts
			: allCosts.filter(
					(cost) => cost.Sprint?.project_id === selectedProject
			  );

	const totals = calculateTotals(filteredCosts);

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Budget Management</h1>
						<p className="text-muted-foreground">
							Track project costs and budget overruns
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
									Total Budget
								</p>
								<p className="text-2xl font-bold">
									${totals.allocated.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Allocated across all sprints
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-blue-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Actual Cost
								</p>
								<p className="text-2xl font-bold">
									${totals.actual.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{((totals.actual / totals.allocated) * 100).toFixed(
										1
									)}
									% of budget
								</p>
							</div>
							<BarChart3 className="h-8 w-8 text-purple-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Over Budget
								</p>
								<p className="text-2xl font-bold text-red-500">
									${totals.overrun.toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{overruns.length} sprint(s) affected
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-red-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Budget Health
								</p>
								<p className="text-2xl font-bold text-green-500">
									{totals.overrun === 0
										? "Good"
										: totals.overrun < totals.allocated * 0.1
										? "Fair"
										: "At Risk"}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Overall status
								</p>
							</div>
							{totals.overrun === 0 ? (
								<CheckCircle className="h-8 w-8 text-green-500" />
							) : (
								<AlertTriangle className="h-8 w-8 text-orange-500" />
							)}
						</div>
					</Card>
				</div>

			{/* Project Filter */}
			<Card className="p-4">
				<div className="flex items-center justify-between">
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
					{selectedProject !== "all" && (
						<Button 
							onClick={() => router.push(`/budget/create?projectId=${selectedProject}`)}
						>
							<Plus className="h-4 w-4 mr-2" />
							Create Budget
						</Button>
					)}
				</div>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="budgets" className="space-y-4">
				<TabsList>
					<TabsTrigger value="budgets">
						<FileText className="h-4 w-4 mr-2" />
						Budgets ({budgets.length})
					</TabsTrigger>
					<TabsTrigger value="overruns">
						<AlertTriangle className="h-4 w-4 mr-2" />
						Budget Overruns ({overruns.length})
					</TabsTrigger>
					<TabsTrigger value="all">
						<BarChart3 className="h-4 w-4 mr-2" />
						All Sprint Costs
					</TabsTrigger>
				</TabsList>

				{/* Budgets Tab */}
				<TabsContent value="budgets" className="space-y-4">
					{budgets.length === 0 ? (
						<Card className="p-12 text-center">
							<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								No Budgets Created Yet
							</h3>
							<p className="text-muted-foreground mb-4">
								Create your first budget by selecting a project above.
							</p>
							{selectedProject !== "all" && (
								<Button 
									onClick={() => router.push(`/budget/create?projectId=${selectedProject}`)}
								>
									<Plus className="h-4 w-4 mr-2" />
									Create First Budget
								</Button>
							)}
						</Card>
					) : (
						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Budget Name</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Initial Budget</TableHead>
										<TableHead>Personnel Budget</TableHead>
										<TableHead>Expected ROI</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Period</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{budgets.map((budget) => (
										<TableRow key={budget.id}>
											<TableCell className="font-medium">
												{budget.name}
											</TableCell>
											<TableCell>
												{budget.Project?.name || "N/A"}
											</TableCell>
											<TableCell>
												${parseFloat(budget.initial_budget).toLocaleString()}
											</TableCell>
											<TableCell>
												${parseFloat(budget.personnel_budget).toLocaleString()}
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="bg-green-50 text-green-700">
													{budget.expected_roi}%
												</Badge>
											</TableCell>
											<TableCell>
												<Badge
													className={
														budget.status === "active"
															? "bg-green-500"
															: budget.status === "completed"
															? "bg-blue-500"
															: "bg-gray-500"
													}
												>
													{budget.status}
												</Badge>
											</TableCell>
											<TableCell>
												{budget.start_date && budget.end_date ? (
													<span className="text-sm">
														{new Date(budget.start_date).toLocaleDateString()} -{" "}
														{new Date(budget.end_date).toLocaleDateString()}
													</span>
												) : (
													<span className="text-sm text-muted-foreground">Not set</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												<Button
													size="sm"
													onClick={() => router.push(`/budget/${budget.id}`)}
												>
													<Eye className="h-4 w-4 mr-2" />
													View Budget
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
					)}
				</TabsContent>

					{/* Budget Overruns Tab */}
					<TabsContent value="overruns" className="space-y-4">
						{overruns.length === 0 ? (
							<Card className="p-12 text-center">
								<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No Budget Overruns!
								</h3>
								<p className="text-muted-foreground">
									All sprints are within budget. Great job! 🎉
								</p>
							</Card>
						) : (
							<Card>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Project</TableHead>
											<TableHead>Sprint</TableHead>
											<TableHead>Employee</TableHead>
											<TableHead>Expected Cost</TableHead>
											<TableHead>Actual Cost</TableHead>
											<TableHead>Overrun</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{overruns.map((cost) => (
											<TableRow key={cost.id}>
												<TableCell className="font-medium">
													{cost.Sprint?.Project?.name}
												</TableCell>
												<TableCell>
													{cost.Sprint?.name}
												</TableCell>
												<TableCell>
													{cost.User?.name}
												</TableCell>
												<TableCell>
													${parseFloat(
														cost.expected_cost
													).toLocaleString()}
												</TableCell>
												<TableCell>
													${parseFloat(
														cost.actual_cost
													).toLocaleString()}
												</TableCell>
												<TableCell>
													<Badge variant="destructive">
														$
														{parseFloat(
															cost.overrun_amount
														).toLocaleString()}
													</Badge>
												</TableCell>
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															analyzeOverrun(cost.sprint_id)
														}
														disabled={
															analyzingSprintId ===
															cost.sprint_id
														}
													>
														{analyzingSprintId ===
														cost.sprint_id
															? "Analyzing..."
															: "AI Analysis"}
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card>
						)}

						{/* AI Analysis Results */}
						{aiAnalysis && (
							<Card className="p-6 bg-blue-50 dark:bg-blue-950">
								<h3 className="text-lg font-semibold mb-4">
									🤖 AI Budget Analysis
								</h3>
								<div className="space-y-4">
									<div>
										<p className="text-sm font-medium mb-2">
											Sprint: {aiAnalysis.sprint.name}
										</p>
										<p className="text-sm text-muted-foreground">
											Project: {aiAnalysis.sprint.project}
										</p>
									</div>

									<div>
										<p className="text-sm font-medium mb-2">
											Analysis:
										</p>
										<p className="text-sm">
											{aiAnalysis.analysis.analysis}
										</p>
									</div>

									{aiAnalysis.analysis.main_causes && (
										<div>
											<p className="text-sm font-medium mb-2">
												Main Causes:
											</p>
											<ul className="list-disc list-inside text-sm space-y-1">
												{Array.isArray(
													aiAnalysis.analysis.main_causes
												)
													? aiAnalysis.analysis.main_causes.map(
															(cause: string, i: number) => (
																<li key={i}>{cause}</li>
															)
													  )
													: typeof aiAnalysis.analysis
															.main_causes === "string" && (
															<li>
																{
																	aiAnalysis.analysis
																		.main_causes
																}
															</li>
													  )}
											</ul>
										</div>
									)}

									{aiAnalysis.analysis.recommendations && (
										<div>
											<p className="text-sm font-medium mb-2">
												Recommendations:
											</p>
											<ul className="list-disc list-inside text-sm space-y-1">
												{Array.isArray(
													aiAnalysis.analysis.recommendations
												)
													? aiAnalysis.analysis.recommendations.map(
															(rec: string, i: number) => (
																<li key={i}>{rec}</li>
															)
													  )
													: typeof aiAnalysis.analysis
															.recommendations === "string" && (
															<li>
																{
																	aiAnalysis.analysis
																		.recommendations
																}
															</li>
													  )}
											</ul>
										</div>
									)}

									<div>
										<Badge
											variant={
												aiAnalysis.analysis.severity === "high"
													? "destructive"
													: aiAnalysis.analysis.severity ===
													  "medium"
													? "warning"
													: "success"
											}
										>
											Severity:{" "}
											{aiAnalysis.analysis.severity?.toUpperCase()}
										</Badge>
									</div>
								</div>
							</Card>
						)}
					</TabsContent>

					{/* All Sprint Costs Tab */}
					<TabsContent value="all">
						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Project</TableHead>
										<TableHead>Sprint</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Allocated</TableHead>
										<TableHead>Expected</TableHead>
										<TableHead>Actual</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center">
												Loading...
											</TableCell>
										</TableRow>
									) : filteredCosts.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center">
												No cost data found
											</TableCell>
										</TableRow>
									) : (
										filteredCosts.map((cost) => {
											const actual = parseFloat(cost.actual_cost);
											const expected = parseFloat(cost.expected_cost);
											const isOverBudget = actual > expected;

											return (
												<TableRow key={cost.id}>
													<TableCell className="font-medium">
														{cost.Sprint?.Project?.name}
													</TableCell>
													<TableCell>
														{cost.Sprint?.name}
													</TableCell>
													<TableCell>
														{cost.User?.name}
													</TableCell>
													<TableCell>
														$
														{parseFloat(
															cost.allocated_budget
														).toLocaleString()}
													</TableCell>
													<TableCell>
														$
														{expected.toLocaleString()}
													</TableCell>
													<TableCell>
														${actual.toLocaleString()}
													</TableCell>
													<TableCell>
														{isOverBudget ? (
															<Badge variant="destructive">
																Over Budget
															</Badge>
														) : actual > expected * 0.9 ? (
															<Badge variant="warning">
																At Risk
															</Badge>
														) : (
															<Badge variant="success">
																On Track
															</Badge>
														)}
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</Layout>
	);
}

