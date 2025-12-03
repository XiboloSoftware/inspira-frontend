// src/pages/panel/components/mis-servicios/sections/EncabezadoSolicitud.jsx
import { formatearFecha, badgeEstadoSolicitud } from "../utils";

export default function EncabezadoSolicitud({ detalle, solicitudBase, progresoChecklist }) {
  const estadoBadge = badgeEstadoSolicitud(
    detalle?.estado?.nombre,
    detalle?.estado?.es_final
  );

  return (
    <div className="flex flex-col gap-1 mb-4">
      <p className="text-xs font-medium text-neutral-500 uppercase">
        Solicitud #{detalle.id_solicitud}
      </p>

      <h2 className="text-lg font-semibold text-neutral-900">
        {detalle.titulo || solicitudBase.titulo || "Servicio sin título"}
      </h2>

      <div className="flex flex-wrap items-center gap-2 mt-1">
        {detalle.tipo?.nombre && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 border">
            {detalle.tipo.nombre}
          </span>
        )}
        <span className={estadoBadge.classes}>{estadoBadge.text}</span>
        <span className="text-[11px] text-neutral-500">
          Código: {detalle.codigo_publico}
        </span>
      </div>

      <p className="text-xs text-neutral-500 mt-1">
        Creada el {formatearFecha(detalle.fecha_creacion)}
        {detalle.fecha_cierre && <> · Cerrada el {formatearFecha(detalle.fecha_cierre)}</>}
      </p>

      {/* Barra de progreso */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
          <span>Progreso del checklist</span>
          <span>{progresoChecklist}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#F49E4B]"
            style={{ width: `${progresoChecklist}%` }}
          />
        </div>
      </div>
    </div>
  );
}
