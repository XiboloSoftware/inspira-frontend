// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import { useMemo } from "react";
import BotonSubirDocumento from "../../checklist/BotonSubirDocumento";
import SeccionPanel from "./SeccionPanel";

const ESTADO_ITEM_CFG = {
  aprobado:  { label: "Aprobado",  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  enviado:   { label: "Enviado",   bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
  observado: { label: "Observado", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
  no_aplica: { label: "No aplica", bg: "bg-neutral-50", text: "text-neutral-500", border: "border-neutral-200", dot: "bg-neutral-400" },
  pendiente: { label: "Pendiente", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
};

function getItemCfg(estado) {
  return ESTADO_ITEM_CFG[(estado || "pendiente").toLowerCase()] || ESTADO_ITEM_CFG.pendiente;
}

export default function ChecklistDocumentos({ checklist, cargarTodo, idSolicitud }) {
  const grupos = {};
  (checklist || []).forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });
  const multiGrupo = Object.keys(grupos).length > 1;

  const total = checklist.length;
  const aprobados = checklist.filter((it) =>
    ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
  ).length;

  const estadoGlobal = useMemo(() => {
    if (!checklist.length) return "pendiente";
    const hasObservado = checklist.some((it) => (it.estado_item || "").toLowerCase() === "observado");
    if (hasObservado) return "observado";
    const allDone = checklist.every((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    );
    return allDone ? "completado" : "pendiente";
  }, [checklist]);

  const subtitulo = total > 0
    ? `${aprobados} de ${total} documentos listos`
    : "Sube los archivos del checklist de tu servicio.";

  return (
    <SeccionPanel
      numero="1"
      titulo="Documentos requeridos"
      subtitulo={subtitulo}
      estado={estadoGlobal}
      defaultOpen={true}
    >
      {Object.keys(grupos).length === 0 && (
        <p className="text-sm text-neutral-400 py-4 text-center">
          Aún no hay checklist configurado.
        </p>
      )}

      {Object.entries(grupos).map(([nombre, items]) => (
        <div key={nombre} className="space-y-3">
          {multiGrupo && (
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
              {nombre}
            </p>
          )}
          {items.map((it) => {
            const docs = it.documentos || [];
            const hayDocs = docs.length > 0;
            const cfg = getItemCfg(it.estado_item);

            return (
              <div
                key={it.id_solicitud_item}
                className={`border rounded-xl p-4 transition-all ${
                  it.estado_item === "observado"
                    ? "border-red-200 bg-red-50/30"
                    : it.estado_item === "aprobado"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{it.item?.nombre_item}</p>
                    {it.item?.descripcion && (
                      <p className="text-xs text-neutral-500 mt-1">{it.item.descripcion}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {it.comentario_asesor && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <span className="text-amber-500 shrink-0">💬</span>
                    <p className="text-sm text-amber-800">{it.comentario_asesor}</p>
                  </div>
                )}

                {it.item?.permite_archivo && (
                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      {hayDocs ? (
                        <>
                          <span className="text-emerald-500">✓</span>
                          <span className="text-sm font-medium text-emerald-700">
                            {docs.length} archivo{docs.length > 1 ? "s" : ""} subido{docs.length > 1 ? "s" : ""}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-neutral-300" />
                          <span className="text-sm text-neutral-400">Sin archivos aún</span>
                        </>
                      )}
                    </div>
                    <BotonSubirDocumento solicitudId={idSolicitud} item={it} onUploaded={cargarTodo} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </SeccionPanel>
  );
}
