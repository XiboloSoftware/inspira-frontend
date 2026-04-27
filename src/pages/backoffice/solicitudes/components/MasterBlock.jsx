// Tabla de tareas de un máster dentro de la programación de postulaciones
import { toDateInputValue } from "../hooks/useProgramacion";

const ESTADOS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO",  label: "En curso" },
  { value: "HECHA",     label: "Hecha" },
  { value: "CANCELADA", label: "Cancelada" },
];

const RESPONSABLES = [
  { value: "INSPIRA", label: "Inspira" },
  { value: "CLIENTE", label: "Cliente" },
];

const inputCls = "border border-neutral-300 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#023A4B]";

export default function MasterBlock({ master, idxMaster, saving, onChange, onAddRow, onRemoveRow, onGuardar }) {
  return (
    <div className="border border-neutral-200 rounded-md p-3 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-neutral-900">{master.master_label || "Máster sin nombre"}</p>
          {master.master_prioridad != null && (
            <p className="text-[11px] text-neutral-500">Prioridad {master.master_prioridad}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onGuardar(idxMaster)}
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
              {["Tarea", "Fecha límite", "Estado", "Responsable", "Observaciones", ""].map((h) => (
                <th key={h} className="text-left font-medium text-neutral-600 px-2 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(master.tareas || []).map((t, idxTarea) => (
              <tr key={t.id_programacion ?? idxTarea}>
                <td className="px-2 py-1 align-top">
                  <input type="text" className={`${inputCls} w-full`} value={t.tarea || ""} onChange={(e) => onChange(idxMaster, idxTarea, "tarea", e.target.value)} />
                </td>
                <td className="px-2 py-1 align-top">
                  <input type="date" className={inputCls} value={toDateInputValue(t.fecha_limite)} onChange={(e) => onChange(idxMaster, idxTarea, "fecha_limite", e.target.value || null)} />
                </td>
                <td className="px-2 py-1 align-top">
                  <select className={`${inputCls} bg-white`} value={t.estado_tarea || "PENDIENTE"} onChange={(e) => onChange(idxMaster, idxTarea, "estado_tarea", e.target.value)}>
                    {ESTADOS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1 align-top">
                  <select className={`${inputCls} bg-white`} value={t.responsable || "INSPIRA"} onChange={(e) => onChange(idxMaster, idxTarea, "responsable", e.target.value)}>
                    {RESPONSABLES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1 align-top">
                  <input type="text" className={`${inputCls} w-full`} value={t.observaciones || ""} onChange={(e) => onChange(idxMaster, idxTarea, "observaciones", e.target.value)} />
                </td>
                <td className="px-2 py-1 align-top">
                  <button type="button" onClick={() => onRemoveRow(idxMaster, idxTarea)} className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2">
        <button type="button" onClick={() => onAddRow(idxMaster)} className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50">
          Añadir tarea
        </button>
      </div>
    </div>
  );
}
