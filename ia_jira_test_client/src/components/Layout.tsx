"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/ui/SidebarNav";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@auth0/nextjs-auth0/client";

export function Layout({ children }: { children: React.ReactNode }) {
	const { theme, setTheme } = useTheme();
	const { user } = useUser();

	return (
		<SidebarProvider>
			<div className='flex w-screen h-screen'>
				{/* Sidebar */}
				<SidebarNav user={user} />

				{/* Main content */}
				<div className='flex flex-col flex-1 overflow-hidden'>
					<header className='flex items-center justify-between h-14 border-b px-4'>
						<SidebarTrigger />
						<div className='flex items-center gap-3'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() =>
									setTheme(
										theme === "light" ? "dark" : "light"
									)
								}
							>
								<Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
								<Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
							</Button>
							{user ? (
								<Button asChild size='sm' variant='outline'>
									<a href='/api/auth/logout'>Logout</a>
								</Button>
							) : (
								<Button asChild size='sm'>
									<a href='/api/auth/login'>Login</a>
								</Button>
							)}
						</div>
					</header>

					<main className='flex-1 overflow-auto p-4'>{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
