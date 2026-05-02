// src/pages/backoffice/solicitudes/ProgramacionPostulacionesAdmin.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { useProgramacion } from "./hooks/useProgramacion";
import MasterBlock from "./components/MasterBlock";

// Mapeo de estado_tramite a columnas kanban
function estadoAColumna(estado) {
  if (!estado) return "pendiente";
  const e = estado.toUpperCase();
  if (e === "SIN_INICIAR") return "pendiente";
  if (["EN_EVALUACION", "PRESENTADA"].includes(e)) return "proceso";
  if (["ADMITIDA", "MATRICULADO", "RESUELTO_FAVORABLE"].includes(e)) return "admitido";
  if (["DENEGADA", "RESUELTO_DESFAVORABLE"].includes(e)) return "denegado";
  if (e === "LISTA_ESPERA") return "espera";
  return "proceso";
}

function KanbanMini({ counts }) {
  const cols = [
    { key: "pendiente", label: "Pendiente",  color: "text-neutral-500",   bg: "bg-neutral-50",  border: "border-neutral-200" },
    { key: "proceso",   label: "En proceso", color: "text-[#1A3557]",     bg: "bg-[#EEF2F8]",   border: "border-[#1A3557]/20" },
    { key: "admitido",  label: "Admitido",   color: "text-[#1D6A4A]",     bg: "bg-[#E8F5EE]",   border: "border-[#1D6A4A]/20" },
    { key: "denegado",  label: "Denegado",   color: "text-red-600",       bg: "bg-red-50",       border: "border-red-200"      },
    { key: "espera",    label: "En espera",  color: "text-amber-600",     bg: "bg-amber-50",     border: "border-amber-200"    },
  ].filter((c) => (counts[c.key] ?? 0) > 0 || ["pendiente","proceso","admitido"].includes(c.key));

  return (
    <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
      {cols.map((col) => (
        <div key={col.key} className={`${col.bg} border ${col.border} rounded-xl py-2 text-center`}>
          <p className={`text-[9px] font-bold uppercase tracking-widest font-mono mb-1 ${col.color}`}>
            {col.label}
          </p>
          <p className={`font-serif text-xl font-bold ${col.color}`}>{counts[col.key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProgramacionPostulacionesAdmin({ idSolicitud }) {
  const {
    masters, loading, saving, error,
    handleChangeField, handleAddRow, handleRemoveRow,
    handleGuardarMaster, handleGenerar,
  } = useProgramacion(idSolicitud);

  const [kanbanCounts, setKanbanCounts] = useState({});

  useEffect(() => {
    async function cargarPortales() {
      try {
        const r = await boGET(`/api/portales/admin/solicitudes/${idSolicitud}`);
        if (!r.ok || !Array.isArray(r.portales)) return;
        const counts = {};
        r.portales.forEach((p) => {
          const col = estadoAColumna(p.estado_tramite);
          counts[col] = (counts[col] ?? 0) + 1;
        });
        setKanbanCounts(counts);
      } catch (e) {
        // silencioso — el kanban es cosmético
      }
    }
    cargarPortales();
  }, [idSolicitud]);

  return (
    <div className="space-y-4">
      {/* Kanban mini */}
      <KanbanMini counts={kanbanCounts} />

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
