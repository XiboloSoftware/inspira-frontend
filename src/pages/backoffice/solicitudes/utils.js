// src/pages/backoffice/solicitudes/utils.js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function formatearFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString();
}
