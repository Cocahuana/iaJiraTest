// src/lib/roles.ts
export type Role = "Empleado" | "PM" | "Ejecutivo" | "Admin";

export const PERMISSIONS = {
	1: "Ver financials totales de la empresa",
	2: "Ver financials de proyectos asignados",
	3: "Ver gráficos (burnout, tareas, etc.)",
	4: "Usar el chat de IA",
	5: "IA: preguntas sobre financials globales",
	6: "IA: preguntas sobre proyectos asignados",
	7: "IA: preguntas sobre gráficos",
	8: "IA: preguntas sobre tareas personales",
	9: "IA: preguntas sobre sprint actual",
	10: "IA: en qué trabajó X empleado",
	11: "IA: quiénes estarán de vacaciones",
	12: "Asignar roles a usuarios",
};

export const ROLE_PERMISSIONS: Record<Role, number[]> = {
	Empleado: [3, 4, 7, 8, 9],
	PM: [2, 3, 4, 6, 7, 8, 9, 10, 11, 12],
	Ejecutivo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	Admin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};
