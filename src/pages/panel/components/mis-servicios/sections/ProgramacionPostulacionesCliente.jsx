// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const ESTADO_TAREA_CFG = {
  pendiente:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  completado: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  en_proceso: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
};
function getTareaCfg(estado) {
  return ESTADO_TAREA_CFG[(estado || "pendiente").toLowerCase().replace(" ", "_")] || ESTADO_TAREA_CFG.pendiente;
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
        if (!r.ok) { if (!cancelled) setError(r.message || r.msg || "No se pudo cargar la programación."); return; }
        if (!cancelled) setMasters(r.masters || []);
      } catch { if (!cancelled) setError("No se pudo cargar la programación."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const subtitulo = loading
    ? "Cargando…"
    : masters.length > 0
    ? `${masters.length} máster${masters.length > 1 ? "es" : ""} con programación`
    : "Las tareas y fechas clave para cada máster elegido.";

  return (
    <SeccionPanel
      numero="6"
      titulo="Programación de postulaciones"
      subtitulo={subtitulo}
    >
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-[#046C8C] rounded-full animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && masters.length === 0 && (
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500">Aún no se ha configurado la programación de postulaciones.</p>
        </div>
      )}

      {!loading && !error && masters.length > 0 && (
        <div className="space-y-4">
          {masters.map((m) => (
            <div key={m.master_prioridad ?? m.master_label} className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900">{m.master_label || "Máster sin nombre"}</p>
                {m.master_prioridad != null && (
                  <p className="text-xs text-neutral-500 mt-0.5">Prioridad {m.master_prioridad}</p>
                )}
              </div>
              {(!m.tareas || m.tareas.length === 0) ? (
                <p className="px-4 py-3 text-sm text-neutral-400">Sin tareas configuradas aún.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {m.tareas.map((t) => {
                    const cfg = getTareaCfg(t.estado_tarea);
                    return (
                      <div key={t.id_programacion} className="px-4 py-3 flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-neutral-800 font-medium">{t.tarea}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">Límite: {formatDate(t.fecha_limite)}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {(t.estado_tarea || "Pendiente").replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SeccionPanel>
  );
}
