// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import CreateSolicitudAdmin from "./CreateSolicitudAdmin";

// Decodifica el JWT del backoffice (localStorage["bo_token"])
function getBackofficeUser() {
  try {
    const token = localStorage.getItem("bo_token");
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload); // { id_usuario, rol, email }
  } catch {
    return null;
  }
}

export default function SolicitudesList({ onVerSolicitud }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [usuario] = useState(() => getBackofficeUser());
  const [mostrarCrear, setMostrarCrear] = useState(false);

  async function cargarSolicitudes() {
    setLoading(true);
    const r = await boGET("/backoffice/solicitudes");
    if (r.ok) setSolicitudes(r.solicitudes || []);
    setLoading(false);
  }

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  function handleVerSolicitud(id) {
    if (onVerSolicitud) onVerSolicitud(id);
  }

  function handleSolicitudCreada(nueva) {
    setSolicitudes((prev) => [nueva, ...prev]);
    setMostrarCrear(false);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabecera + botón crear (solo admin) */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-primary">Solicitudes</h1>

        {usuario?.rol === "admin" && (
          <button
            type="button"
            onClick={() => setMostrarCrear((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]"
          >
            {mostrarCrear ? "Cerrar formulario" : "Crear solicitud"}
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-600 mb-6">
        Expedientes generados por los clientes, incluyendo los creados
        automáticamente al pagar servicios.
      </p>

      {/* Formulario de creación (solo admin) */}
      {usuario?.rol === "admin" && mostrarCrear && (
        <CreateSolicitudAdmin onCreated={handleSolicitudCreada} />
      )}

      {/* Listado de solicitudes */}
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

                  <p className="text-sm text-neutral-900 font-semibold mt-0.5">
                    {s.cliente_nombre || "Cliente sin nombre"}
                  </p>
                  {s.cliente_email && (
                    <p className="text-xs text-neutral-500">
                      {s.cliente_email}
                    </p>
                  )}

                  <p className="text-xs text-neutral-500 mt-0.5">
                    Origen: {s.origen || "N/D"} ·{" "}
                    {new Date(s.fecha_creacion).toLocaleString()}
                  </p>

                  {s.total_pagado > 0 && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Total pagado: {s.total_pagado}{" "}
                      {s.pagos?.[0]?.moneda || ""}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVerSolicitud(s.id_solicitud)}
                    className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
                  >
                    Ver solicitud
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
