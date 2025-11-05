// src/config/roles.ts

export const ROLES = {
	ADMIN: "rol_syosrbtQ224bWJvV",
	EJECUTIVE: "rol_6Fd2mVnwibPSt4Db",
	EMPLOYEE: "rol_AQjGbnel3qzO18Ov",
	PM: "rol_J4JTtts5J4ia4guK",
};

export const ROLE_LABELS: Record<string, string> = {
	[ROLES.ADMIN]: "Admin",
	[ROLES.EJECUTIVE]: "Ejecutive",
	[ROLES.EMPLOYEE]: "Employee",
	[ROLES.PM]: "Project Manager",
};

// Opcional: permisos asociados a cada rol
export const ROLE_PERMISSIONS = {
	[ROLES.ADMIN]: ["view_all", "edit_all", "manage_users"],
	[ROLES.EJECUTIVE]: ["view_reports", "view_summaries"],
	[ROLES.EMPLOYEE]: ["view_tasks", "update_tasks"],
	[ROLES.PM]: ["view_summaries", "manage_projects", "receive_alerts"],
};
