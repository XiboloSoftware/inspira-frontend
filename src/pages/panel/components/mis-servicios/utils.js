// src/pages/panel/components/mis-servicios/utils.js

export function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  try {
    return new Date(fechaIso).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fechaIso;
  }
}

export function badgeEstadoSolicitud(nombreEstado, esFinal) {
  if (!nombreEstado) {
    return {
      text: "Sin estado",
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200",
    };
  }

  const n = nombreEstado.toLowerCase();

  if (esFinal || n.includes("complet") || n.includes("final") || n.includes("cerrad")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }

  if (n.includes("observ") || n.includes("rechaz") || n.includes("deneg")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200",
    };
  }

  if (n.includes("pend")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200",
    };
  }

  return {
    text: nombreEstado,
    classes:
      "text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200",
  };
}

export function badgeEstadoItemChecklist(estado) {
  const e = (estado || "pendiente").toLowerCase();

  if (e === "aprobado") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (e === "observado") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (e === "enviado") {
    return "bg-sky-50 text-sky-700 border border-sky-200";
  }
  if (e === "no_aplica") {
    return "bg-neutral-50 text-neutral-600 border border-neutral-200";
  }

  // pendiente
  return "bg-neutral-100 text-neutral-700 border border-neutral-200";
}
