// src/pages/panel/components/mis-servicios/sections/ProgramacionPostulacionesCliente.jsx
import { useEffect, useMemo, useState } from "react";
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

const TIMELINE_VACIO = [
  { label: "Confirmación de másteres por asesor",  fecha: "Pendiente tu elección" },
  { label: "Apertura de portales de admisión",     fecha: "A definir según máster" },
  { label: "Envío de documentación",               fecha: "A definir según portal" },
  { label: "Resolución de admisión",               fecha: "Estimado: 4-6 semanas tras cierre" },
];

function StatCard({ label, value, colorClass }) {
  return (
    <div className={`text-center p-4 rounded-xl ${colorClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}

function TimelineVacio() {
  return (
    <div className="relative pl-5 mt-2">
      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-neutral-200" />
      {TIMELINE_VACIO.map((item, idx) => (
        <div key={idx} className="relative mb-4">
          <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-neutral-300 bg-white" />
          <p className="text-sm font-semibold text-neutral-700">{item.label}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{item.fecha}</p>
        </div>
      ))}
    </div>
  );
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

  const stats = useMemo(() => {
    const allTareas = masters.flatMap((m) => m.tareas || []);
    return {
      pendiente:  allTareas.filter((t) => (t.estado_tarea || "pendiente").toLowerCase() === "pendiente").length,
      en_proceso: allTareas.filter((t) => (t.estado_tarea || "").toLowerCase() === "en_proceso").length,
      completado: allTareas.filter((t) => (t.estado_tarea || "").toLowerCase() === "completado").length,
    };
  }, [masters]);

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
      sectionId="6"
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
        <div className="space-y-4">
          {/* Aviso de sección bloqueada */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">⚠️</span>
            <p className="text-sm text-amber-800">
              Esta sección se desbloqueará una vez tu asesor confirme tu elección de másteres.
            </p>
          </div>

          {/* Stats en cero */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Pendiente"  value="0" colorClass="border border-neutral-200 text-neutral-400" />
            <StatCard label="En proceso" value="0" colorClass="bg-sky-50 text-sky-600" />
            <StatCard label="Admitido"   value="0" colorClass="bg-emerald-50 text-emerald-700" />
          </div>

          {/* Timeline vacío */}
          <TimelineVacio />
        </div>
      )}

      {!loading && !error && masters.length > 0 && (
        <div className="space-y-4">
          {/* Stats derivadas de las tareas */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Pendiente"
              value={stats.pendiente}
              colorClass="border border-neutral-200 text-neutral-400"
            />
            <StatCard
              label="En proceso"
              value={stats.en_proceso}
              colorClass="bg-sky-50 text-sky-600"
            />
            <StatCard
              label="Completado"
              value={stats.completado}
              colorClass="bg-emerald-50 text-emerald-700"
            />
          </div>

          {/* Lista de másteres con sus tareas */}
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
