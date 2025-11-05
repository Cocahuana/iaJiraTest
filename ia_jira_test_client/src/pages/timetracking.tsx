'use client';

import { useState, useEffect } from "react";
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
import { Clock, CheckCircle, AlertCircle, XCircle, DollarSign } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function TimeTrackingPage() {
	const [loading, setLoading] = useState(true);
	const [unbilledEntries, setUnbilledEntries] = useState<any[]>([]);
	const [unapprovedEntries, setUnapprovedEntries] = useState<any[]>([]);
	const [missingUsers, setMissingUsers] = useState<any[]>([]);
	const [totalUnbilledHours, setTotalUnbilledHours] = useState(0);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [unbilledRes, unapprovedRes, missingRes] = await Promise.all([
				axios.get(`${API_URL}/api/timeentries/unbilled`).catch(err => {
					console.error("Error fetching unbilled:", err?.response?.data || err.message);
					return { data: { entries: [], totalHours: 0 } };
				}),
				axios.get(`${API_URL}/api/timeentries/unapproved`).catch(err => {
					console.error("Error fetching unapproved:", err?.response?.data || err.message);
					return { data: { entries: [] } };
				}),
				axios.get(`${API_URL}/api/timeentries/missing?days=7`).catch(err => {
					console.error("Error fetching missing:", err?.response?.data || err.message);
					return { data: { missingUsers: [] } };
				}),
			]);

			setUnbilledEntries(unbilledRes.data.entries || []);
			setTotalUnbilledHours(unbilledRes.data.totalHours || 0);
			setUnapprovedEntries(unapprovedRes.data.entries || []);
			setMissingUsers(missingRes.data.missingUsers || []);
		} catch (error: any) {
			console.error("Error fetching data:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const approveEntry = async (entryId: string) => {
		try {
			await axios.post(`${API_URL}/api/timeentries/${entryId}/approve`, {
				approver_id: "current-user-id", // Replace with actual user ID
			});
			fetchData(); // Refresh data
		} catch (error: any) {
			console.error("Error approving entry:", error?.response?.data || error.message);
		}
	};

	const markAsBilled = async (entryId: string) => {
		try {
			await axios.post(`${API_URL}/api/timeentries/${entryId}/bill`);
			fetchData(); // Refresh data
		} catch (error: any) {
			console.error("Error marking as billed:", error?.response?.data || error.message);
		}
	};

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Time Tracking & Billing</h1>
						<p className="text-muted-foreground">
							Manage time entries and billing status
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
									Unbilled Hours
								</p>
								<p className="text-2xl font-bold text-blue-500">
									{totalUnbilledHours.toFixed(1)}
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
									Pending Approval
								</p>
								<p className="text-2xl font-bold text-yellow-500">
									{unapprovedEntries.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Entries to review
								</p>
							</div>
							<AlertCircle className="h-8 w-8 text-yellow-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Missing Entries
								</p>
								<p className="text-2xl font-bold text-red-500">
									{missingUsers.length}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Users (last 7 days)
								</p>
							</div>
							<XCircle className="h-8 w-8 text-red-500" />
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Revenue Potential
								</p>
								<p className="text-2xl font-bold text-green-500">
									${(totalUnbilledHours * 100).toLocaleString()}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									@$100/hour estimate
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-green-500" />
						</div>
					</Card>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="unbilled" className="space-y-4">
					<TabsList>
						<TabsTrigger value="unbilled">
							Unbilled ({unbilledEntries.length})
						</TabsTrigger>
						<TabsTrigger value="unapproved">
							Pending Approval ({unapprovedEntries.length})
						</TabsTrigger>
						<TabsTrigger value="missing">
							Missing Entries ({missingUsers.length})
						</TabsTrigger>
					</TabsList>

					{/* Unbilled Tab */}
					<TabsContent value="unbilled">
						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Task</TableHead>
										<TableHead>Hours</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Status</TableHead>
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
									) : unbilledEntries.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} className="text-center">
												<div className="py-8">
													<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
													<p className="text-muted-foreground">
														All entries are billed! 🎉
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										unbilledEntries.map((entry) => (
											<TableRow key={entry.id}>
												<TableCell>
													{format(
														new Date(entry.date),
														"MMM dd, yyyy"
													)}
												</TableCell>
												<TableCell className="font-medium">
													{entry.User?.name}
												</TableCell>
												<TableCell>
													{entry.Project?.name}
												</TableCell>
												<TableCell>{entry.Task?.title}</TableCell>
												<TableCell>{entry.hours}h</TableCell>
												<TableCell className="max-w-xs truncate">
													{entry.description || "-"}
												</TableCell>
												<TableCell>
													{entry.approved ? (
														<Badge variant="success">
															Approved
														</Badge>
													) : (
														<Badge variant="warning">
															Pending
														</Badge>
													)}
												</TableCell>
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() => markAsBilled(entry.id)}
														disabled={!entry.approved}
													>
														Mark Billed
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</Card>
					</TabsContent>

					{/* Unapproved Tab */}
					<TabsContent value="unapproved">
						<Card>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Project</TableHead>
										<TableHead>Task</TableHead>
										<TableHead>Hours</TableHead>
										<TableHead>Description</TableHead>
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
									) : unapprovedEntries.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center">
												<div className="py-8">
													<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
													<p className="text-muted-foreground">
														No entries pending approval!
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										unapprovedEntries.map((entry) => (
											<TableRow key={entry.id}>
												<TableCell>
													{format(
														new Date(entry.date),
														"MMM dd, yyyy"
													)}
												</TableCell>
												<TableCell className="font-medium">
													{entry.User?.name}
												</TableCell>
												<TableCell>
													{entry.Project?.name}
												</TableCell>
												<TableCell>{entry.Task?.title}</TableCell>
												<TableCell>{entry.hours}h</TableCell>
												<TableCell className="max-w-xs truncate">
													{entry.description || "-"}
												</TableCell>
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() => approveEntry(entry.id)}
													>
														Approve
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</Card>
					</TabsContent>

					{/* Missing Entries Tab */}
					<TabsContent value="missing">
						<Card className="p-6">
							<h3 className="text-lg font-semibold mb-4">
								Users Without Time Entries (Last 7 Days)
							</h3>
							{loading ? (
								<p className="text-center">Loading...</p>
							) : missingUsers.length === 0 ? (
								<div className="text-center py-8">
									<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
									<p className="text-muted-foreground">
										All users have logged their time! 🎉
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<div className="flex flex-wrap gap-3">
										{missingUsers.map((user: any) => (
											<Card key={user.id} className="p-4 flex-1 min-w-[200px]">
												<div className="flex items-start justify-between">
													<div>
														<p className="font-medium">{user.name}</p>
														<p className="text-sm text-muted-foreground">
															{user.email}
														</p>
													</div>
													<Badge variant="destructive">Missing</Badge>
												</div>
												<Button
													variant="outline"
													size="sm"
													className="mt-3 w-full"
												>
													Send Reminder
												</Button>
											</Card>
										))}
									</div>
									<div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
										<p className="text-sm font-medium mb-2">
											⚠️ Action Required
										</p>
										<p className="text-sm text-muted-foreground">
											These users need to be reminded to log their hours for
											accurate billing and project tracking.
										</p>
									</div>
								</div>
							)}
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</Layout>
	);
}

