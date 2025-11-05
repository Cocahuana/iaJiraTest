// src/components/RoleGuard.tsx
"use client";
import { ReactNode } from "react";
import useUserRole from "@/hooks/useUserRole";

interface RoleGuardProps {
	allowed: string[];
	children: ReactNode;
}

export default function RoleGuard({ allowed, children }: RoleGuardProps) {
	const user2 = useUserRole();
	const user = { roleId: "hello" }; // Temporal
	if (!user) return null; // No cargó aún

	return allowed.includes(user.roleId) ? <>{children}</> : null;
}
