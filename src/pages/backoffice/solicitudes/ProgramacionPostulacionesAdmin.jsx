import { useMemo, useState } from "react";
import { boSaveProgramacionPostulaciones } from "../../../services/backofficeApi";

export default function ProgramacionPostulacionesAdmin({
  idSolicitud,
  programacionInicial,
  onUpdated,
}) {
  const [tareas, setTareas] = useState(programacionInicial || []);
  const [savingMaster, setSavingMaster] = useState(null);

  // agrupar por máster
  const porMaster = useMemo(() => {
    return tareas.reduce((acc, t) => {
      const key = String(t.id_master || "sin-master");
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});
  }, [tareas]);

  const handleChange = (id_programacion, field, value) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id_programacion === id_programacion ? { ...t, [field]: value } : t
      )
    );
  };

  const handleAddRow = (idMaster) => {
    setTareas((prev) => [
      ...prev,
      {
        id_programacion: `tmp-${Date.now()}`, // temporal en front
        id_solicitud: idSolicitud,
        id_master: Number(idMaster),
        tarea: "",
        fecha_limite: null,
        estado_tarea: "PENDIENTE",
        responsable: "INSPIRA",
        observaciones: "",
      },
    ]);
  };

  const handleRemoveRow = (id_programacion) => {
    setTareas((prev) =>
      prev.filter((t) => t.id_programacion !== id_programacion)
    );
  };

  const handleGuardarMaster = async (idMaster) => {
    const idNum = Number(idMaster);
    const lista = tareas.filter((t) => Number(t.id_master) === idNum);

    setSavingMaster(idNum);
    try {
      const payload = lista.map((t) => ({
        tarea: t.tarea,
        fecha_limite: t.fecha_limite,
        estado_tarea: t.estado_tarea,
        responsable: t.responsable,
        observaciones: t.observaciones,
      }));

      const r = await boSaveProgramacionPostulaciones(
        idSolicitud,
        idNum,
        payload
      );

      if (!r.ok) {
        window.alert(r.msg || "Error al guardar programación");
        return;
      }

      // Reemplazar en estado solo las filas de ese máster con las devueltas
      setTareas((prev) => {
        const otras = prev.filter((t) => Number(t.id_master) !== idNum);
        return [...otras, ...r.tareas];
      });

      onUpdated?.();
    } catch (e) {
      console.error(e);
      window.alert("Error al guardar programación");
    } finally {
      setSavingMaster(null);
    }
  };

  if (tareas.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        Aún no hay tareas de programación creadas para esta solicitud.
      </p>
    );
  }

  return (
    <section className="border border-neutral-200 rounded-lg p-3 mb-4">
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">
        6. Programación de postulaciones
      </h3>
      <p className="text-xs text-neutral-500 mb-3">
        Define tareas, fechas límite y estados para cada máster confirmado.
      </p>

      <div className="space-y-4">
        {Object.entries(porMaster).map(([idMaster, lista]) => (
          <div key={idMaster} className="border border-neutral-100 rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-800">
                Máster #{idMaster}
              </p>
              <button
                type="button"
                onClick={() => handleGuardarMaster(idMaster)}
                disabled={savingMaster === Number(idMaster)}
                className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
              >
                {savingMaster === Number(idMaster)
                  ? "Guardando…"
                  : "Guardar cambios"}
              </button>
            </div>

            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="text-neutral-600 border-b">
                  <th className="text-left py-1 pr-2">Tarea</th>
                  <th className="text-left py-1 pr-2">Fecha límite</th>
                  <th className="text-left py-1 pr-2">Estado</th>
                  <th className="text-left py-1 pr-2">Responsable</th>
                  <th className="text-left py-1 pr-2">Obs.</th>
                  <th className="py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((t) => (
                  <tr key={t.id_programacion}>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        className="w-full border border-neutral-300 rounded px-1 py-0.5"
                        value={t.tarea || ""}
                        onChange={(e) =>
                          handleChange(t.id_programacion, "tarea", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="date"
                        className="border border-neutral-300 rounded px-1 py-0.5"
                        value={
                          t.fecha_limite
                            ? String(t.fecha_limite).substring(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          handleChange(
                            t.id_programacion,
                            "fecha_limite",
                            e.target.value || null
                          )
                        }
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <select
                        className="border border-neutral-300 rounded px-1 py-0.5"
                        value={t.estado_tarea || "PENDIENTE"}
                        onChange={(e) =>
                          handleChange(
                            t.id_programacion,
                            "estado_tarea",
                            e.target.value
                          )
                        }
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_CURSO">En curso</option>
                        <option value="HECHA">Hecha</option>
                        <option value="CANCELADA">Cancelada</option>
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <select
                        className="border border-neutral-300 rounded px-1 py-0.5"
                        value={t.responsable || "INSPIRA"}
                        onChange={(e) =>
                          handleChange(
                            t.id_programacion,
                            "responsable",
                            e.target.value
                          )
                        }
                      >
                        <option value="INSPIRA">Inspira</option>
                        <option value="CLIENTE">Cliente</option>
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        className="w-full border border-neutral-300 rounded px-1 py-0.5"
                        value={t.observaciones || ""}
                        onChange={(e) =>
                          handleChange(
                            t.id_programacion,
                            "observaciones",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td className="py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(t.id_programacion)}
                        className="text-[11px] text-red-600"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={() => handleAddRow(idMaster)}
              className="mt-2 text-[11px] px-2 py-1 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Añadir tarea
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
