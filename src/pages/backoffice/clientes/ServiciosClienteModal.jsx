// src/pages/backoffice/clientes/ServiciosClienteModal.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

function navTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const ESTADO_COLORES = {
  "En proceso": "bg-sky-100 text-sky-700",
  "Completado": "bg-emerald-100 text-emerald-700",
  "Cancelado": "bg-red-100 text-red-600",
  "Pendiente": "bg-amber-100 text-amber-700",
};

function estadoCls(estado) {
  return ESTADO_COLORES[estado] || "bg-neutral-100 text-neutral-600";
}

export default function ServiciosClienteModal({ cliente, onClose }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/clientes/${cliente.id_cliente}/solicitudes`);
    if (r.ok) setSolicitudes(r.solicitudes || []);
    setLoading(false);
  }

  function irASolicitud(id_solicitud) {
    onClose();
    navTo(`/backoffice/solicitudes/${id_solicitud}`);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Solicitudes de {cliente.nombre || cliente.email_contacto}
            </h2>
            {!loading && (
              <p className="text-xs text-neutral-400 mt-0.5">
                {solicitudes.length === 0
                  ? "Sin solicitudes registradas"
                  : `${solicitudes.length} solicitud${solicitudes.length !== 1 ? "es" : ""}`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-neutral-400">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Cargando solicitudes…</span>
            </div>
          )}

          {!loading && solicitudes.length === 0 && (
            <div className="text-center py-10 text-neutral-400">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Este cliente no tiene solicitudes registradas.</p>
            </div>
          )}

          {!loading && solicitudes.length > 0 && (
            <div className="space-y-2">
              {solicitudes.map((s) => (
                <div
                  key={s.id_solicitud}
                  className="border border-neutral-200 rounded-xl px-4 py-3 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {s.titulo || "(Sin título)"}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {s.tipo && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                            {s.tipo}
                          </span>
                        )}
                        {s.estado && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${estadoCls(s.estado)}`}>
                            {s.estado}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Link a la solicitud */}
                    <button
                      type="button"
                      onClick={() => irASolicitud(s.id_solicitud)}
                      title="Ver solicitud"
                      className="shrink-0 flex items-center gap-1 text-xs text-primary font-medium hover:underline px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Ver
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-neutral-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Fecha:{" "}
                      {new Date(s.fecha_creacion).toLocaleDateString("es-ES", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </span>
                    {s.total_pagado > 0 && (
                      <span className="text-emerald-600 font-medium">
                        Pagado: {s.total_pagado} {s.pagos?.[0]?.moneda || ""}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
