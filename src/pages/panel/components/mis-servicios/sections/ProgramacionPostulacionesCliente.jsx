// Bloque 6 – Programación de postulaciones (vista cliente)

import { formatearFechaCorta } from "../utils"; // o reutiliza formateo existente

export default function ProgramacionPostulacionesCliente({ programacion }) {
  const lista = Array.isArray(programacion) ? programacion : [];
  if (lista.length === 0) {
    return null; // no mostrar nada si aún no han configurado tareas
  }

  // agrupar por id_master
  const porMaster = lista.reduce((acc, t) => {
    const key = String(t.id_master || "sin-master");
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <section className="border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">
        6. Programación de postulaciones
      </h3>
      <p className="text-xs text-neutral-500 mb-3">
        Tareas y fechas clave de la postulación para cada máster confirmado.
      </p>

      <div className="space-y-4">
        {Object.entries(porMaster).map(([idMaster, tareas]) => (
          <div key={idMaster} className="border border-neutral-100 rounded p-2">
            <p className="text-xs font-semibold text-neutral-800 mb-1">
              Máster #{idMaster}
            </p>

            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] text-neutral-600 border-b">
                  <th className="text-left py-1 pr-2">Tarea</th>
                  <th className="text-left py-1 pr-2">Fecha límite</th>
                  <th className="text-left py-1">Estado</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((t) => (
                  <tr key={t.id_programacion}>
                    <td className="text-[11px] py-1 pr-2">
                      {t.tarea || "(Sin nombre)"}
                    </td>
                    <td className="text-[11px] py-1 pr-2">
                      {t.fecha_limite ? formatearFechaCorta(t.fecha_limite) : "-"}
                    </td>
                    <td className="text-[11px] py-1">
                      {t.estado_tarea || "PENDIENTE"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
