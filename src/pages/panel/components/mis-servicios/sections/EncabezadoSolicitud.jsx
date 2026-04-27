// src/pages/panel/components/mis-servicios/sections/EncabezadoSolicitud.jsx
import { formatearFecha, badgeEstadoSolicitud } from "../utils";

export default function EncabezadoSolicitud({ detalle, solicitudBase, progresoChecklist }) {
  const estadoBadge = badgeEstadoSolicitud(
    detalle?.estado?.nombre,
    detalle?.estado?.es_final
  );

  return (
    <div className="mb-4 pb-4 border-b border-neutral-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Info principal */}
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Solicitud #{detalle.id_solicitud}
          </p>
          <h2 className="text-sm font-bold text-neutral-900 leading-snug">
            {detalle.titulo || solicitudBase.titulo || "Servicio sin título"}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {detalle.tipo?.nombre && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#023A4B]/10 text-[#023A4B] font-semibold">
                {detalle.tipo.nombre}
              </span>
            )}
            <span className={estadoBadge.classes}>{estadoBadge.text}</span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {detalle.codigo_publico}
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            Creada el {formatearFecha(detalle.fecha_creacion)}
            {detalle.fecha_cierre && <> · Cerrada el {formatearFecha(detalle.fecha_cierre)}</>}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="min-w-[150px] sm:min-w-[180px] flex-shrink-0">
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
            <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5">
              <span className="font-medium">Progreso del checklist</span>
              <span className="font-bold text-neutral-700">{progresoChecklist}%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#F49E4B] transition-all duration-500"
                style={{ width: `${progresoChecklist}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
