// src/hooks/usePermissions.ts
import { ROLE_PERMISSIONS, Role } from "@/lib/roles";

export function usePermissions(role: Role) {
	const hasPermission = (permissionId: number) => {
		return ROLE_PERMISSIONS[role]?.includes(permissionId) || false;
	};

	return { hasPermission };
}
