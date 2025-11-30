// src/pages/panel/components/mis-servicios/ServiciosList.jsx
import { formatearFecha, badgeEstadoSolicitud } from "./utils";

function ServiciosList({
  servicios,
  loading,
  error,
  onRecargar,
  onVerDetalle,
}) {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Mis servicios contratados
          </span>

          <button
            type="button"
            onClick={onRecargar}
            className="text-xs px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
          >
            Actualizar
          </button>
        </div>

        {loading && (
          <p className="px-4 py-4 text-sm text-neutral-500">
            Cargando tus servicios…
          </p>
        )}

        {!loading && error && (
          <p className="px-4 py-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (!servicios || servicios.length === 0) && (
          <p className="px-4 py-4 text-sm text-neutral-500">
            Aún no tienes servicios contratados. Cuando se apruebe un pago en
            Mercado Pago, tu servicio aparecerá aquí automáticamente.
          </p>
        )}

        {!loading && !error && servicios && servicios.length > 0 && (
          <div className="divide-y">
            {servicios.map((s) => {
              const estadoBadge = badgeEstadoSolicitud(
                s.estado?.nombre,
                s.estado?.es_final
              );

              return (
                <div
                  key={s.id_solicitud}
                  className="px-4 py-3 flex justify-between items-start gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">
                        {s.titulo || "Servicio sin título"}
                      </span>

                      {s.tipo?.nombre && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {s.tipo.nombre}
                        </span>
                      )}

                      <span className={estadoBadge.classes}>
                        {estadoBadge.text}
                      </span>
                    </div>

                    {s.descripcion && (
                      <p className="text-xs text-neutral-600 mt-1">
                        {s.descripcion}
                      </p>
                    )}

                    <p className="text-xs text-neutral-500 mt-1">
                      Creada el {formatearFecha(s.fecha_creacion)}
                      {s.fecha_cierre && (
                        <>
                          {" · "}Cerrada el {formatearFecha(s.fecha_cierre)}
                        </>
                      )}
                    </p>

                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Código de seguimiento: {s.codigo_publico}
                    </p>

                    {s.origen && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Origen: {s.origen}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(s)}
                      className="text-xs px-3 py-1.5 rounded-md bg-[#F49E4B] text-white hover:bg-[#D88436] transition"
                    >
                      Ver solicitud
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        Nota: estas solicitudes se generan automáticamente cuando un pago de
        Mercado Pago se aprueba (por ejemplo: “Programa Máster 360°”,
        “Postulación en Andalucía”, etc.).
      </p>
    </div>
  );
}

export default ServiciosList;
