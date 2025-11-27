// src/pages/backoffice/diagnosticos/components/bloqueEstadoUtils.js

// Función para decidir clases del badge
export function estadoBadgeClass(tipo) {
  if (tipo === "pagado") return "bg-emerald-100 text-emerald-700";
  if (tipo === "prereservado") return "bg-amber-100 text-amber-700";
  if (tipo === "reservado") return "bg-blue-100 text-blue-700";
  if (tipo === "bloqueado") return "bg-rose-100 text-rose-700";
  return "bg-sky-100 text-sky-700"; // libre
}

// Estado visual (texto + tipo) a partir del bloque
export function getEstadoTurnoVisual(b) {
  // Cualquier reserva o pre-reserva pagada → pagado
  if (b.tiene_reservas || (b.pre_pagadas || 0) > 0) {
    return { texto: "pagado", tipo: "pagado" };
  }

  // Pre-reservas pendientes → prereservado
  if ((b.pre_pendientes || 0) > 0) {
    const n = b.pre_pendientes;
    return {
      texto: n === 1 ? "1 prereserva" : `${n} prereservas`,
      tipo: "prereservado",
    };
  }

  // Bloqueado manualmente
  if (b.estado === "bloqueado") {
    return { texto: "bloqueado", tipo: "bloqueado" };
  }

  // Libre
  return { texto: "libre", tipo: "libre" };
}

// Clave simple para filtros: "libre", "pagado", "prereservado", "bloqueado"
export function getEstadoTurnoClave(b) {
  const v = getEstadoTurnoVisual(b);
  return v.tipo; // reutilizamos la misma lógica
}

// Texto de asignación, sin contar admin
export function getAsignacionTexto(b) {
  if (b.usuario && b.usuario.nombre) {
    const nombre = b.usuario.nombre.trim();
    if (!nombre.toLowerCase().includes("admin")) {
      return `ASIGNADO A ${nombre.toUpperCase()}`;
    }
  }
  return "SIN ASIGNAR";
}
