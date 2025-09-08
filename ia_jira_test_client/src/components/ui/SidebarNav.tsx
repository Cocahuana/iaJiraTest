"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarFooter,
} from "@/components/ui/sidebar";
import {
	LayoutDashboard,
	TrendingUp,
	Compass,
	Star,
	Settings,
	Home,
	BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({ user }: { user?: any }) {
	const pathname = usePathname();

	const mainNav = [
		{ title: "Organization", icon: LayoutDashboard, href: "/" },
		{
			title: "Projects",
			icon: TrendingUp,
			href: "/projects",
			sub: [
				{ title: "Home", href: "/projects" },
				{ title: "Finance", href: "/projects/finance" },
				{ title: "Graphs", href: "/projects/graphs" },
			],
		},
		{ title: "Prompts", icon: Compass, href: "/prompts" },
		{ title: "Graph", icon: Star, href: "/graph" },
		{ title: "Settings", icon: Settings, href: "/settings" },
	];

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNav.map((item) => (
								<div key={item.title}>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.href}
										>
											<Link href={item.href}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
									{item.sub && (
										<div className='ml-6 mt-1 space-y-1'>
											{item.sub.map((sub) => (
												<SidebarMenuItem key={sub.href}>
													<SidebarMenuButton
														asChild
														isActive={
															pathname ===
															sub.href
														}
													>
														<Link href={sub.href}>
															<span>
																{sub.title}
															</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</div>
									)}
								</div>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				{user && (
					<div className='flex items-center gap-3 p-2'>
						<img
							src={user.picture || "/default-avatar.png"}
							alt={user.name}
							className='w-8 h-8 rounded-full'
						/>
						<div>
							{/* <p className='text-sm font-medium'>{user.name}</p> */}
							<p className='text-xs text-muted-foreground'>
								{user.email}
							</p>
						</div>
					</div>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}
