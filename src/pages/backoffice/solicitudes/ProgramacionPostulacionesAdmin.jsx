// src/pages/backoffice/solicitudes/ProgramacionPostulacionesAdmin.jsx
import { useProgramacion } from "./hooks/useProgramacion";
import MasterBlock from "./components/MasterBlock";

export default function ProgramacionPostulacionesAdmin({ idSolicitud }) {
  const {
    masters, loading, saving, error,
    handleChangeField, handleAddRow, handleRemoveRow,
    handleGuardarMaster, handleGenerar,
  } = useProgramacion(idSolicitud);

  return (
    <section className="border border-neutral-200 rounded-lg p-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-neutral-900">6. Programación de postulaciones</h3>
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
        Gestiona las tareas por cada máster confirmado: fechas límite, estado y responsable.
      </p>

      {loading && <p className="text-xs text-neutral-500">Cargando programación…</p>}
      {error && !loading && <p className="text-xs text-red-600 mb-2">{error}</p>}
      {!loading && !error && masters.length === 0 && (
        <p className="text-xs text-neutral-500">
          Aún no hay tareas configuradas. Puedes generarlas desde la elección de másteres con el botón de arriba.
        </p>
      )}

      {!loading && !error && masters.length > 0 && (
        <div className="space-y-4">
          {masters.map((m, idxMaster) => (
            <MasterBlock
              key={m.master_prioridad ?? idxMaster}
              master={m}
              idxMaster={idxMaster}
              saving={saving}
              onChange={handleChangeField}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
              onGuardar={handleGuardarMaster}
            />
          ))}
        </div>
      )}
    </section>
  );
}
