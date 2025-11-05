// src/taskRunner.js

export async function runSystemTasks() {
	const tasks = [
		{
			name: "Backup de base de datos",
			logs: [
				"[12:00] Iniciando backup...",
				"[12:01] Compresión completada",
				"[12:02] Upload a S3 exitoso",
				"[12:03] Backup finalizado sin errores ✅",
			],
		},
		{
			name: "Sync de ventas diarias",
			logs: [
				"[12:05] Conectando a API...",
				"[12:06] 124 registros procesados",
				"[12:07] Error: token expirado (401)",
				"[12:08] Reintento exitoso",
				"[12:09] Sincronización completada con advertencias ⚠️",
			],
		},
	];

	return tasks;
}
