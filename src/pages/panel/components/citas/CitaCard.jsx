// src/pages/panel/components/citas/CitaCard.jsx
import { esCancelada, getEstadoConfig } from "./citasUtils";

export default function CitaCard({ cita }) {
  const { label, className } = getEstadoConfig(cita.estado);

  const fechaTexto = cita.fecha
    ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

  const rangoHora =
    cita.hora_inicio && cita.hora_fin
      ? `${cita.hora_inicio.slice(0, 5)} – ${cita.hora_fin.slice(0, 5)}`
      : cita.hora_inicio
      ? cita.hora_inicio.slice(0, 5)
      : "";

  const importe =
    typeof cita.monto === "number"
      ? cita.monto.toFixed(2)
      : cita.monto ?? "0.00";

  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-900">
          {fechaTexto}
          {rangoHora && ` · ${rangoHora}`}
        </p>
        <p className="text-xs text-neutral-600">
          Diagnóstico de inmigración
        </p>
      </div>

      <div className="text-right text-xs space-y-1">
        <span
          className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full font-medium ${className}`}
        >
          {label}
        </span>
        <p className="text-neutral-700">
          Importe: {importe} {cita.moneda}
        </p>

        {cita.enlace_meet && !esCancelada(cita) && (
          <a
            href={cita.enlace_meet}
            target="_blank"
            rel="noreferrer"
            className="inline-flex px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            Entrar a la reunión
          </a>
        )}
      </div>
    </div>
  );
}
