'use client';

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Bell,
	AlertTriangle,
	DollarSign,
	Calendar,
	TrendingUp,
	Clock,
	CheckCircle,
	X,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { useUser } from "@auth0/nextjs-auth0/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NotificationsPage() {
	const { user } = useUser();
	const [loading, setLoading] = useState(true);
	const [notifications, setNotifications] = useState<any[]>([]);
	const [filter, setFilter] = useState("all"); // all, unread, read

	useEffect(() => {
		if (user) {
			fetchNotifications();
		}
	}, [user]);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const res = await axios.get(
				`${API_URL}/api/notifications/user/${user?.sub}`
			);
			setNotifications(res.data.notifications || []);
		} catch (error: any) {
			console.error("Error fetching notifications:", error?.response?.data || error.message);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (notificationId: string) => {
		try {
			await axios.put(
				`${API_URL}/api/notifications/${notificationId}/read`
			);
			fetchNotifications();
		} catch (error: any) {
			console.error("Error marking notification as read:", error?.response?.data || error.message);
		}
	};

	const markAllAsRead = async () => {
		try {
			await axios.put(
				`${API_URL}/api/notifications/user/${user?.sub}/read-all`
			);
			fetchNotifications();
		} catch (error: any) {
			console.error("Error marking all as read:", error?.response?.data || error.message);
		}
	};

	const dismissNotification = async (notificationId: string) => {
		try {
			await axios.put(
				`${API_URL}/api/notifications/${notificationId}/dismiss`
			);
			fetchNotifications();
		} catch (error: any) {
			console.error("Error dismissing notification:", error?.response?.data || error.message);
		}
	};

	const getNotificationIcon = (type: string) => {
		const iconMap: any = {
			budget_overrun: DollarSign,
			sprint_ending: Calendar,
			burnout_alert: TrendingUp,
			vacation_reminder: Calendar,
			time_entry_missing: Clock,
		};
		const Icon = iconMap[type] || Bell;
		return <Icon className="h-5 w-5" />;
	};

	const getNotificationColor = (priority: string) => {
		const colorMap: any = {
			critical: "text-red-500",
			high: "text-orange-500",
			medium: "text-yellow-500",
			low: "text-blue-500",
		};
		return colorMap[priority] || "text-gray-500";
	};

	const getPriorityBadge = (priority: string) => {
		const variantMap: any = {
			critical: "destructive",
			high: "warning",
			medium: "secondary",
			low: "outline",
		};
		return (
			<Badge variant={variantMap[priority] || "outline"}>
				{priority?.toUpperCase()}
			</Badge>
		);
	};

	const filteredNotifications = notifications.filter((notification) => {
		if (filter === "unread") return notification.status === "unread";
		if (filter === "read")
			return notification.status === "read" || notification.status === "actioned";
		return true;
	});

	const unreadCount = notifications.filter(
		(n) => n.status === "unread"
	).length;

	const groupedNotifications = filteredNotifications.reduce((groups: any, notification) => {
		const type = notification.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(notification);
		return groups;
	}, {});

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3">
							<Bell className="h-8 w-8" />
							Notifications
							{unreadCount > 0 && (
								<Badge variant="destructive">{unreadCount}</Badge>
							)}
						</h1>
						<p className="text-muted-foreground">
							Stay updated on important events and alerts
						</p>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={fetchNotifications}>
							Refresh
						</Button>
						{unreadCount > 0 && (
							<Button onClick={markAllAsRead}>Mark All as Read</Button>
						)}
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Total Notifications
								</p>
								<p className="text-2xl font-bold">
									{notifications.length}
								</p>
							</div>
							<Bell className="h-8 w-8 text-blue-500" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Unread
								</p>
								<p className="text-2xl font-bold text-orange-500">
									{unreadCount}
								</p>
							</div>
							<AlertTriangle className="h-8 w-8 text-orange-500" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Critical Alerts
								</p>
								<p className="text-2xl font-bold text-red-500">
									{
										notifications.filter(
											(n) => n.priority === "critical"
										).length
									}
								</p>
							</div>
							<AlertTriangle className="h-8 w-8 text-red-500" />
						</div>
					</Card>
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Today
								</p>
								<p className="text-2xl font-bold text-green-500">
									{
										notifications.filter((n) => {
											const today = new Date();
											const created = new Date(n.createdAt);
											return (
												created.toDateString() ===
												today.toDateString()
											);
										}).length
									}
								</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-500" />
						</div>
					</Card>
				</div>

				{/* Filters */}
				<div className="flex gap-2">
					<Button
						variant={filter === "all" ? "default" : "outline"}
						onClick={() => setFilter("all")}
					>
						All
					</Button>
					<Button
						variant={filter === "unread" ? "default" : "outline"}
						onClick={() => setFilter("unread")}
					>
						Unread ({unreadCount})
					</Button>
					<Button
						variant={filter === "read" ? "default" : "outline"}
						onClick={() => setFilter("read")}
					>
						Read
					</Button>
				</div>

				{/* Notifications List */}
				<div className="space-y-4">
					{loading ? (
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">Loading notifications...</p>
						</Card>
					) : filteredNotifications.length === 0 ? (
						<Card className="p-12 text-center">
							<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								You're all caught up!
							</h3>
							<p className="text-muted-foreground">
								No {filter !== "all" && filter} notifications at this time.
							</p>
						</Card>
					) : (
						<Tabs defaultValue={Object.keys(groupedNotifications)[0] || "all"}>
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								{Object.keys(groupedNotifications).map((type) => (
									<TabsTrigger key={type} value={type}>
										{type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} ({groupedNotifications[type].length})
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent value="all" className="space-y-3 mt-4">
								{filteredNotifications.map((notification) => (
									<Card
										key={notification.id}
										className={`p-4 ${
											notification.status === "unread"
												? "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950"
												: ""
										}`}
									>
										<div className="flex items-start gap-4">
											<div
												className={`p-2 rounded-full ${getNotificationColor(
													notification.priority
												)} bg-opacity-10`}
											>
												{getNotificationIcon(notification.type)}
											</div>
											<div className="flex-1">
												<div className="flex items-start justify-between mb-2">
													<div>
														<h4 className="font-semibold">
															{notification.title}
														</h4>
														<p className="text-sm text-muted-foreground">
															{notification.message}
														</p>
													</div>
													<div className="flex items-center gap-2">
														{getPriorityBadge(notification.priority)}
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																dismissNotification(
																	notification.id
																)
															}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												</div>
												<div className="flex items-center justify-between">
													<p className="text-xs text-muted-foreground">
														{format(
															new Date(notification.createdAt),
															"MMM dd, yyyy 'at' hh:mm a"
														)}
													</p>
													{notification.status === "unread" && (
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																markAsRead(notification.id)
															}
														>
															Mark as Read
														</Button>
													)}
												</div>
											</div>
										</div>
									</Card>
								))}
							</TabsContent>

							{Object.keys(groupedNotifications).map((type) => (
								<TabsContent
									key={type}
									value={type}
									className="space-y-3 mt-4"
								>
									{groupedNotifications[type].map((notification: any) => (
										<Card
											key={notification.id}
											className={`p-4 ${
												notification.status === "unread"
													? "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950"
													: ""
											}`}
										>
											<div className="flex items-start gap-4">
												<div
													className={`p-2 rounded-full ${getNotificationColor(
														notification.priority
													)} bg-opacity-10`}
												>
													{getNotificationIcon(notification.type)}
												</div>
												<div className="flex-1">
													<div className="flex items-start justify-between mb-2">
														<div>
															<h4 className="font-semibold">
																{notification.title}
															</h4>
															<p className="text-sm text-muted-foreground">
																{notification.message}
															</p>
														</div>
														<div className="flex items-center gap-2">
															{getPriorityBadge(
																notification.priority
															)}
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	dismissNotification(
																		notification.id
																	)
																}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</div>
													<div className="flex items-center justify-between">
														<p className="text-xs text-muted-foreground">
															{format(
																new Date(notification.createdAt),
																"MMM dd, yyyy 'at' hh:mm a"
															)}
														</p>
														{notification.status === "unread" && (
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	markAsRead(notification.id)
																}
															>
																Mark as Read
															</Button>
														)}
													</div>
												</div>
											</div>
										</Card>
									))}
								</TabsContent>
							))}
						</Tabs>
					)}
				</div>
			</div>
		</Layout>
	);
}

