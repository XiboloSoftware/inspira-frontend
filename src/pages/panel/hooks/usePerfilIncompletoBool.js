import { useMemo } from "react";

const CHECKS = [
  u => u?.nombre,
  u => u?.pais_origen,
  u => u?.datos_extra?.fecha_nacimiento,
  u => u?.pasaporte,
  u => u?.datos_extra?.pasaporte_vencimiento,
  u => u?.datos_extra?.carrera_titulo,
  u => u?.datos_extra?.universidad_origen,
  u => u?.datos_extra?.inicio_estudios,
  u => u?.datos_extra?.fin_estudios,
  u => u?.datos_extra?.inicio_previsto,
  u => u?.datos_extra?.presupuesto_hasta,
];

export function usePerfilIncompletoBool(user) {
  return useMemo(
    () => !!user && CHECKS.some(fn => { const v = fn(user); return !v || !String(v).trim(); }),
    [user]
  );
}
