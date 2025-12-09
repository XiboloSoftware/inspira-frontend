// src/pages/backoffice/solicitudes/ProgramacionPostulacionesAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "HECHA", label: "Hecha" },
  { value: "CANCELADA", label: "Cancelada" },
];

const RESPONSABLES = [
  { value: "INSPIRA", label: "Inspira" },
  { value: "CLIENTE", label: "Cliente" },
];

export default function ProgramacionPostulacionesAdmin({ idSolicitud }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const r = await boGET(
        `/api/programacion/admin/solicitudes/${idSolicitud}`
      );
      if (!r.ok) {
        setError(r.message || r.msg || "No se pudo cargar la programación.");
        setMasters([]);
        return;
      }
      setMasters(r.masters || []);
    } catch (e) {
      console.error(e);
      setError("Error al cargar la programación de postulaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  const handleChangeField = (idxMaster, idxTarea, field, value) => {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        const tareas = (m.tareas || []).map((t, j) =>
          j === idxTarea ? { ...t, [field]: value } : t
        );
        return { ...m, tareas };
      })
    );
  };

  const handleAddRow = (idxMaster) => {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        const tareas = [
          ...(m.tareas || []),
          {
            tarea: "",
            fecha_limite: null,
            estado_tarea: "PENDIENTE",
            responsable: "INSPIRA",
            observaciones: "",
          },
        ];
        return { ...m, tareas };
      })
    );
  };

  const handleRemoveRow = (idxMaster, idxTarea) => {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        const tareas = (m.tareas || []).filter((_, j) => j !== idxTarea);
        return { ...m, tareas };
      })
    );
  };

  const handleGuardarMaster = async (idxMaster) => {
    const m = masters[idxMaster];
    if (!m) return;
    setSaving(true);
    try {
      const payload = {
        master_label: m.master_label,
        tareas: (m.tareas || []).map((t) => ({
          tarea: t.tarea,
          fecha_limite: t.fecha_limite
            ? toDateInputValue(t.fecha_limite)
            : "",
          estado_tarea: t.estado_tarea || "PENDIENTE",
          responsable: t.responsable || "INSPIRA",
          observaciones: t.observaciones || "",
        })),
      };

      const r = await boPATCH(
        `/api/programacion/admin/solicitudes/${idSolicitud}/master/${
          m.master_prioridad || idxMaster + 1
        }`,
        payload
      );

      if (!r.ok) {
        window.alert(
          r.message ||
            r.msg ||
            "No se pudo guardar la programación de este máster."
        );
        return;
      }

      await cargar();
      window.alert("Programación guardada.");
    } catch (e) {
      console.error(e);
      window.alert("Error al guardar la programación.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerar = async () => {
    if (
      !window.confirm(
        "Se crearán tareas por defecto según la elección del cliente. ¿Continuar?"
      )
    )
      return;

    setSaving(true);
    try {
      const r = await boPOST(
        `/api/programacion/admin/solicitudes/${idSolicitud}/generar-desde-eleccion`,
        {}
      );
      if (!r.ok) {
        window.alert(
          r.message ||
            r.msg ||
            "No se pudo generar la programación desde la elección."
        );
        return;
      }
      await cargar();
      window.alert("Tareas generadas correctamente.");
    } catch (e) {
      console.error(e);
      window.alert("Error al generar las tareas por defecto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border border-neutral-200 rounded-lg p-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          6. Programación de postulaciones
        </h3>

        <button
          type="button"
          onClick={handleGenerar}
          disabled={saving}
          className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-60"
        >
          {saving ? "Procesando…" : "Generar tareas desde elección (Bloque 5)"}
        </button>
      </div>

      <p className="text-xs text-neutral-600 mb-3">
        Aquí gestionas las tareas por cada máster confirmado: fechas límite,
        estado y responsable. No se guardan documentos ni claves, solo la agenda
        operativa.
      </p>

      {loading && (
        <p className="text-xs text-neutral-500">Cargando programación…</p>
      )}

      {error && !loading && (
        <p className="text-xs text-red-600 mb-2">{error}</p>
      )}

      {!loading && !error && masters && masters.length === 0 && (
        <p className="text-xs text-neutral-500">
          Aún no hay tareas configuradas. Puedes generarlas desde la elección de
          másteres (Bloque 5) con el botón de arriba.
        </p>
      )}

      {!loading && !error && masters && masters.length > 0 && (
        <div className="space-y-4">
          {masters.map((m, idxMaster) => (
            <div
              key={m.master_prioridad ?? idxMaster}
              className="border border-neutral-200 rounded-md p-3 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
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

                <button
                  type="button"
                  onClick={() => handleGuardarMaster(idxMaster)}
                  disabled={saving}
                  className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60 self-start sm:self-auto"
                >
                  {saving ? "Guardando…" : "Guardar cambios en este máster"}
                </button>
              </div>

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
                      <th className="text-left font-medium text-neutral-600 px-2 py-1">
                        Responsable
                      </th>
                      <th className="text-left font-medium text-neutral-600 px-2 py-1">
                        Observaciones
                      </th>
                      <th className="px-2 py-1" />
                    </tr>
                  </thead>
                  <tbody>
                    {(m.tareas || []).map((t, idxTarea) => (
                      <tr key={t.id_programacion ?? idxTarea}>
                        <td className="px-2 py-1 align-top">
                          <input
                            type="text"
                            className="w-full border border-neutral-300 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                            value={t.tarea || ""}
                            onChange={(e) =>
                              handleChangeField(
                                idxMaster,
                                idxTarea,
                                "tarea",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <input
                            type="date"
                            className="border border-neutral-300 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                            value={toDateInputValue(t.fecha_limite)}
                            onChange={(e) =>
                              handleChangeField(
                                idxMaster,
                                idxTarea,
                                "fecha_limite",
                                e.target.value || null
                              )
                            }
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <select
                            className="border border-neutral-300 rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                            value={t.estado_tarea || "PENDIENTE"}
                            onChange={(e) =>
                              handleChangeField(
                                idxMaster,
                                idxTarea,
                                "estado_tarea",
                                e.target.value
                              )
                            }
                          >
                            {ESTADOS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <select
                            className="border border-neutral-300 rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                            value={t.responsable || "INSPIRA"}
                            onChange={(e) =>
                              handleChangeField(
                                idxMaster,
                                idxTarea,
                                "responsable",
                                e.target.value
                              )
                            }
                          >
                            {RESPONSABLES.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1 align-top">
                          <input
                            type="text"
                            className="w-full border border-neutral-300 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                            value={t.observaciones || ""}
                            onChange={(e) =>
                              handleChangeField(
                                idxMaster,
                                idxTarea,
                                "observaciones",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-2 py-1 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveRow(idxMaster, idxTarea)
                            }
                            className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleAddRow(idxMaster)}
                  className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50"
                >
                  Añadir tarea
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
