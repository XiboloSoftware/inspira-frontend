// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";

function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  try {
    return new Date(fechaIso).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fechaIso;
  }
}

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarServicios();
  }, []);

  async function cargarServicios() {
    setLoading(true);
    setError("");
    try {
      const r = await apiGET("/solicitudes/mias");
      if (r.ok) {
        setServicios(r.solicitudes || []);
      } else {
        setError(r.message || r.msg || "No se pudieron cargar tus servicios.");
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar tus servicios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Mis servicios contratados
          </span>

          <button
            type="button"
            onClick={cargarServicios}
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
            {servicios.map((s) => (
              <div
                key={s.id_solicitud}
                className="px-4 py-3 flex justify-between items-start gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {s.titulo || "Servicio sin título"}
                    </span>

                    {s.tipo?.nombre && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {s.tipo.nombre}
                      </span>
                    )}

                    {s.estado?.nombre && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {s.estado.nombre}
                      </span>
                    )}
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
              </div>
            ))}
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
