// src/pages/panel/components/citas/citasUtils.js

export const PAGE_SIZE = 7;

export function esFechaFutura(cita) {
  if (!cita.fecha || !cita.hora_inicio) return false;
  const [h, m] = cita.hora_inicio.split(":").map(Number);
  const [y, mo, d] = cita.fecha.split("-").map(Number); // YYYY-MM-DD
  const dt = new Date(y, mo - 1, d, h || 0, m || 0, 0, 0);
  return dt.getTime() > Date.now();
}

export function esCancelada(cita) {
  if (!cita.estado) return false;
  return cita.estado.toLowerCase().includes("cancel");
}

export function getEstadoConfig(estadoRaw) {
  const estado = (estadoRaw || "").toLowerCase();

  if (estado.includes("pend")) {
    return {
      label: "Pendiente de pago",
      className: "bg-amber-100 text-amber-700",
    };
  }

  if (estado.includes("pag")) {
    return {
      label: "Pagado",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (estado.includes("cancel")) {
    return {
      label: "Cancelado",
      className: "bg-rose-100 text-rose-700",
    };
  }

  if (estado.includes("expir")) {
    return {
      label: "Expirada",
      className: "bg-neutral-200 text-neutral-700",
    };
  }

  return {
    label: estadoRaw || "Sin estado",
    className: "bg-neutral-100 text-neutral-700",
  };
}
