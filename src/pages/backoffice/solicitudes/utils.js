// src/pages/backoffice/solicitudes/utils.js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function formatearFecha(fecha) {
  if (!fecha) return "";
  // Si es solo fecha (YYYY-MM-DD), forzar mediodía local para evitar desfase UTC
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(fecha))
    ? new Date(fecha + "T12:00:00")
    : new Date(fecha);
  if (isNaN(d)) return String(fecha);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}
