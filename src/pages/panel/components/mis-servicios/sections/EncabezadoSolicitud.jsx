// src/pages/panel/components/mis-servicios/sections/EncabezadoSolicitud.jsx
import { formatearFecha, badgeEstadoSolicitud } from "../utils";

export default function EncabezadoSolicitud({ detalle, solicitudBase, progresoChecklist }) {
  const estadoBadge = badgeEstadoSolicitud(
    detalle?.estado?.nombre,
    detalle?.estado?.es_final
  );

  const progresoColor =
    progresoChecklist >= 100
      ? "bg-emerald-500"
      : progresoChecklist >= 50
      ? "bg-[#F49E4B]"
      : "bg-[#F49E4B]";

  return (
    <div className="mb-6 pb-6 border-b border-neutral-100">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

        {/* Info principal */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#046C8C] uppercase tracking-widest mb-2">
            Solicitud #{detalle.id_solicitud}
          </p>
          <h2 className="text-2xl font-bold text-neutral-900 leading-tight mb-3">
            {detalle.titulo || solicitudBase.titulo || "Servicio sin título"}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {detalle.tipo?.nombre && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#023A4B]/10 text-[#023A4B] font-semibold">
                {detalle.tipo.nombre}
              </span>
            )}
            <span className={estadoBadge.classesLg || estadoBadge.classes}>
              {estadoBadge.text}
            </span>
            <span className="text-xs text-neutral-400 font-mono bg-neutral-100 px-2 py-1 rounded">
              {detalle.codigo_publico}
            </span>
          </div>

          <p className="text-sm text-neutral-400 mt-3">
            Creada el {formatearFecha(detalle.fecha_creacion)}
            {detalle.fecha_cierre && (
              <> · Cerrada el {formatearFecha(detalle.fecha_cierre)}</>
            )}
          </p>
        </div>

        {/* Progreso del checklist */}
        <div className="lg:min-w-[240px] lg:max-w-[280px] w-full lg:w-auto">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-semibold text-neutral-700">
                Progreso del checklist
              </span>
              <span className="text-2xl font-bold text-neutral-900">
                {progresoChecklist}%
              </span>
            </div>
            <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${progresoColor}`}
                style={{ width: `${progresoChecklist}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              {progresoChecklist >= 100
                ? "¡Documentos completos!"
                : progresoChecklist === 0
                ? "Sube tus documentos para avanzar"
                : "En progreso — sigue subiendo documentos"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
