'use client';

import { Layout } from "@/components/Layout";
import { KpiCard } from "@/components/KpiCard";
import { ChatPrompt } from "@/components/ChatPrompt";
import { usePermissions } from "@/hooks/usePermissions";
import RoleGuard from "@/components/RoleGuard";
import { ROLES } from "@/config/roles";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
export default function Dashboard() {
	const [token, setToken] = useState<string | null>(null);
	const [session, setSession] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { user } = useUser();
	const roleId = user?.role;
	useEffect(() => {
		async function fetchToken() {
			try {
				const res = await fetch("/api/auth/session");
				if (!res.ok) {
					throw new Error("Not logged in");
				}
				const data = await res.json();
				setToken(data.accessToken);
				setSession(data.session);
			} catch (err: any) {
				setError(err.message);
			}
		}

		fetchToken();
	}, []);
	return (
		<Layout>
			<div className='space-y-6'>
				<h1 className='text-3xl font-bold'>Organization Dashboard</h1>
				<div className='p-4'>
					{error && <p className='text-red-500'>{error}</p>}
					{token ? (
						<div>
							<h3>Access Token:</h3>
							<code className='break-words'>{token}</code>
							<h3>User</h3>
							<pre className='break-words'>
								{JSON.stringify(user, null, 2)}
							</pre>
							<p>Role: {roleId as string}</p>
						</div>
					) : (
						!error && <p>Loading token...</p>
					)}
				</div>
				<RoleGuard allowed={[ROLES.ADMIN, ROLES.PM]}>
					<button className='btn btn-primary'>
						Generate AI Sprint Summary
					</button>
				</RoleGuard>

				<RoleGuard allowed={[ROLES.EJECUTIVE]}>
					<div className='bg-blue-50 p-4 rounded'>
						Executive View: Read-only Reports
					</div>
				</RoleGuard>

				<RoleGuard allowed={[ROLES.EMPLOYEE]}>
					<div className='bg-green-50 p-4 rounded'>
						Your tasks for today
					</div>
				</RoleGuard>
			</div>
		</Layout>
	);
}
