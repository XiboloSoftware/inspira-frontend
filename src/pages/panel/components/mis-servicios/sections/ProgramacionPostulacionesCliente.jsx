// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../../../services/api";

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export default function ProgramacionPostulacionesCliente({ idSolicitud }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const r = await apiGET(`/programacion/panel/solicitudes/${idSolicitud}`);
        if (!r.ok) {
          if (!cancelled)
            setError(
              r.message || r.msg || "No se pudo cargar la programación."
            );
          return;
        }
        if (!cancelled) setMasters(r.masters || []);
      } catch (e) {
        if (!cancelled)
          setError("No se pudo cargar la programación de postulaciones.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [idSolicitud]);

  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        6. Programación de postulaciones
      </h3>
      <p className="text-xs text-neutral-600 mb-2">
        Aquí verás, para cada máster elegido, las tareas y fechas clave de la
        postulación. Es solo informativo: no necesitas editar nada desde aquí.
      </p>

      {loading && (
        <p className="text-xs text-neutral-500">Cargando programación…</p>
      )}

      {error && !loading && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {!loading && !error && (!masters || masters.length === 0) && (
        <p className="text-xs text-neutral-500">
          Aún no se ha configurado la programación de postulaciones para esta
          solicitud.
        </p>
      )}

      {!loading && !error && masters && masters.length > 0 && (
        <div className="space-y-4">
          {masters.map((m) => (
            <div
              key={m.master_prioridad ?? m.master_label}
              className="border border-neutral-200 rounded-md p-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    {m.master_label || "Máster sin nombre"}
                  </p>
                  {m.master_prioridad != null && (
                    <p className="text-[11px] text-neutral-500">
                      Prioridad {m.master_prioridad}
                    </p>
                  )}
                </div>
              </div>

              {(!m.tareas || m.tareas.length === 0) && (
                <p className="text-[11px] text-neutral-500">
                  Aún no hay tareas configuradas para este máster.
                </p>
              )}

              {m.tareas && m.tareas.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-[11px]">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left font-medium text-neutral-600 px-2 py-1">
                          Tarea
                        </th>
                        <th className="text-left font-medium text-neutral-600 px-2 py-1">
                          Fecha límite
                        </th>
                        <th className="text-left font-medium text-neutral-600 px-2 py-1">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.tareas.map((t) => (
                        <tr key={t.id_programacion}>
                          <td className="px-2 py-1 align-top text-neutral-800">
                            {t.tarea}
                          </td>
                          <td className="px-2 py-1 align-top text-neutral-700">
                            {formatDate(t.fecha_limite)}
                          </td>
                          <td className="px-2 py-1 align-top">
                            <span className="inline-flex px-2 py-0.5 rounded-full border border-neutral-200 text-[10px] text-neutral-700 bg-neutral-50">
                              {t.estado_tarea
                                .replace("_", " ")
                                .toLowerCase()
                                .replace(/^\w/, (c) => c.toUpperCase())}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
