// src/pages/panel/components/mis-servicios/ServiciosList.jsx
import { formatearFecha, badgeEstadoSolicitud } from "./utils";

function ServiciosList({ servicios, loading, error, onRecargar, onVerDetalle }) {
  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Mis servicios</h2>
          <p className="text-xs text-neutral-500">Servicios contratados con Inspira</p>
        </div>
        <button
          type="button"
          onClick={onRecargar}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 shadow-sm transition font-medium"
        >
          Actualizar
        </button>
      </div>

      {/* Estados */}
      {loading && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center shadow-sm">
          <div className="w-6 h-6 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-neutral-400">Cargando tus servicios…</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (!servicios || servicios.length === 0) && (
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-600">Aún no tienes servicios contratados.</p>
          <p className="text-xs text-neutral-400 mt-1.5 max-w-sm mx-auto">
            Cuando se apruebe un pago, tu servicio aparecerá aquí automáticamente.
          </p>
        </div>
      )}

      {/* Grid de cards */}
      {!loading && !error && servicios && servicios.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {servicios.map((s) => {
            const estadoBadge = badgeEstadoSolicitud(s.estado?.nombre, s.estado?.es_final);

            return (
              <div
                key={s.id_solicitud}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-neutral-300 transition-all duration-200"
              >
                {/* Badges + título */}
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={estadoBadge.classes}>{estadoBadge.text}</span>
                    {s.tipo?.nombre && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#023A4B]/8 text-[#023A4B] font-medium border border-[#023A4B]/15">
                        {s.tipo.nombre}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                    {s.titulo || "Servicio sin título"}
                  </h3>
                  {s.descripcion && (
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{s.descripcion}</p>
                  )}
                </div>

                {/* Footer de la card */}
                <div className="flex items-end justify-between gap-2 pt-2.5 border-t border-neutral-100 mt-auto">
                  <div className="text-[10px] text-neutral-400 space-y-0.5 min-w-0">
                    <p>Creada el {formatearFecha(s.fecha_creacion)}</p>
                    <p className="font-mono truncate">{s.codigo_publico}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onVerDetalle(s)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-[#F49E4B] text-white font-semibold hover:bg-[#D88436] active:scale-95 transition-all shadow-sm"
                  >
                    Ver →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-neutral-400">
        Las solicitudes se generan automáticamente cuando un pago se aprueba.
      </p>
    </div>
  );
}

export default ServiciosList;
