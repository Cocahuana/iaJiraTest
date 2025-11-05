// src/hooks/useUserRole.ts
import { useState, useEffect } from "react";
import { ROLES } from "@/config/roles";
import { useUser, UserProfile } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
interface UserInfo {
	email: string;
	email_verified: boolean;
	name: string;
	nickname: string;
	picture: string;
	sid: string;
	sub: string;
	updated_at: string;
}

export default async function useUserRole() {
	const { user: auth0User } = useUser();

	useEffect(() => {
		// Si ya estás logueado con Okta, esto puede venir del contexto de Auth o del token JWT
	}, []);

	const user = auth0User;
	const isAdmin = "user?.roleId === ROLES.ADMIN";
	const isPM = "user?.roleId === ROLES.PM";
	const isEmployee = "user?.roleId === ROLES.EMPLOYEE";
	const isEjecutive = "user?.roleId === ROLES.EJECUTIVE";

	return { user, isAdmin, isPM, isEmployee, isEjecutive };
}
