// catalogoConstants.js — constantes y helpers compartidos del módulo Catálogo

export const RAMAS = [
  { value: "ARTES_HUMANIDADES",          label: "Artes y Humanidades" },
  { value: "CIENCIAS",                   label: "Ciencias" },
  { value: "CIENCIAS_SALUD",             label: "Ciencias de la Salud" },
  { value: "CIENCIAS_SOCIALES_JURIDICAS",label: "Ciencias Sociales y Jurídicas" },
  { value: "INGENIERIA_ARQUITECTURA",    label: "Ingeniería y Arquitectura" },
];

export const MODALIDADES = [
  { value: "PRESENCIAL",     label: "Presencial" },
  { value: "VIRTUAL",        label: "Virtual / Online" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
  { value: "HIBRIDA",        label: "Híbrida" },
];

export const LISTAS_INSPIRA = [
  { value: "LISTA_1", label: "Lista 1 — Prioridad alta" },
  { value: "LISTA_2", label: "Lista 2 — Prioridad media" },
  { value: "LISTA_3", label: "Lista 3 — Referencia" },
];

export const TIENE_PRACTICAS_OPCIONES = [
  { value: "",      label: "Sin dato" },
  { value: "true",  label: "Sí" },
  { value: "false", label: "No" },
];

export function formatPrecio(val) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0 });
}

export function duracionLabel(anios) {
  if (!anios) return "—";
  const n = Number(anios);
  if (n === 1)   return "1 año";
  if (n === 1.5) return "1.5 años";
  return "2 años";
}

export function listaBadge(lista) {
  const map = {
    LISTA_1: "bg-emerald-100 text-emerald-700",
    LISTA_2: "bg-blue-100 text-blue-700",
    LISTA_3: "bg-neutral-100 text-neutral-600",
  };
  const labelMap = { LISTA_1: "L1", LISTA_2: "L2", LISTA_3: "L3" };
  return { cls: map[lista] || "bg-neutral-100 text-neutral-600", label: labelMap[lista] || lista };
}

export function activoBadge(activo) {
  return activo
    ? { cls: "bg-emerald-100 text-emerald-700", label: "Activo" }
    : { cls: "bg-red-100 text-red-600",         label: "Inactivo" };
}

export const MODAL_OVERLAY =
  "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm";
export const MODAL_PANEL =
  "bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto";
