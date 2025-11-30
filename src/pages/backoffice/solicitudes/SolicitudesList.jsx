import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function SolicitudesList() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/solicitudes");
    if (r.ok) setSolicitudes(r.solicitudes || []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-1">
        Solicitudes
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Expedientes generados por los clientes, incluyendo los creados
        automáticamente al pagar servicios.
      </p>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Listado de solicitudes
          </span>
          {loading && (
            <span className="text-xs text-neutral-500">Cargando…</span>
          )}
        </div>

        {(!solicitudes || solicitudes.length === 0) && !loading && (
          <p className="px-4 py-3 text-sm text-neutral-500">
            Aún no hay solicitudes registradas.
          </p>
        )}

        {solicitudes && solicitudes.length > 0 && (
          <div className="divide-y">
            {solicitudes.map((s) => (
              <div
                key={s.id_solicitud}
                className="px-4 py-3 flex justify-between items-start gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {s.titulo || "(Sin título)"}
                    </span>
                    {s.tipo && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {s.tipo}
                      </span>
                    )}
                    {s.estado && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {s.estado}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Cliente:{" "}
                    {s.cliente_nombre
                      ? `${s.cliente_nombre} <${s.cliente_email || ""}>`
                      : "N/D"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Origen: {s.origen || "N/D"} ·{" "}
                    {new Date(s.fecha_creacion).toLocaleString()}
                  </p>
                  {s.total_pagado > 0 && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Total pagado: {s.total_pagado} {s.pagos?.[0]?.moneda || ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
