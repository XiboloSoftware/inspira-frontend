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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-600">
          Gestiona las tareas por cada máster confirmado: fechas límite, estado y responsable.
        </p>
        <button
          type="button"
          onClick={handleGenerar}
          disabled={saving}
          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-60 transition font-medium whitespace-nowrap"
        >
          {saving ? "Procesando…" : "Generar tareas desde elección (Bloque 5)"}
        </button>
      </div>

      {loading && <p className="text-xs text-neutral-500">Cargando programación…</p>}
      {error && !loading && <p className="text-xs text-red-600">{error}</p>}
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
    </div>
  );
}
