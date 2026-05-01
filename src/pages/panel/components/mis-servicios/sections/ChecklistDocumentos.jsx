// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import { useState, useMemo } from "react";
import BotonSubirDocumento from "../../checklist/BotonSubirDocumento";
import SeccionPanel from "./SeccionPanel";
import { apiDELETE } from "../../../../../services/api";

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

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }) {
  const m = mimeType || "";
  if (m.includes("pdf"))
    return (
      <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-red-500 leading-none">PDF</span>
      </div>
    );
  if (m.includes("image"))
    return (
      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  if (m.includes("word") || m.includes("doc"))
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-blue-500 leading-none">DOC</span>
      </div>
    );
  if (m.includes("sheet") || m.includes("excel") || m.includes("xls"))
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-emerald-500 leading-none">XLS</span>
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
      </svg>
    </div>
  );
}

function DocumentoChip({ doc, canDelete, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(doc.id_documento);
    } finally {
      setDeleting(false);
    }
  }

  const rev = (doc.estado_revision || "").toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-sm transition-all group">
      <FileIcon mimeType={doc.mime_type} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-800 truncate leading-snug" title={doc.nombre_original}>
          {doc.nombre_original}
        </p>
        <p className="text-xs text-neutral-400 leading-none mt-0.5">{formatBytes(doc.tamano_bytes)}</p>
      </div>

      {rev === "APROBADO" && (
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Aprobado
        </span>
      )}
      {rev === "OBSERVADO" && (
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Observado
        </span>
      )}

      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Eliminar archivo"
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:cursor-wait"
        >
          {deleting ? (
            <span className="w-3 h-3 border border-neutral-300 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
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

  async function handleEliminarDocumento(idDocumento) {
    await apiDELETE(`/api/panel/documentos/${idDocumento}`);
    if (cargarTodo) cargarTodo();
  }

  return (
    <SeccionPanel
      numero="1"
      titulo="Documentos requeridos"
      subtitulo={subtitulo}
      estado={estadoGlobal}
      sectionId="1"
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
            const itemAprobado = (it.estado_item || "").toLowerCase() === "aprobado";

            return (
              <div
                key={it.id_solicitud_item}
                className={`border rounded-2xl p-4 transition-all ${
                  it.estado_item === "observado"
                    ? "border-red-200 bg-red-50/30"
                    : it.estado_item === "aprobado"
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                {/* Encabezado del item */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{it.item?.nombre_item}</p>
                    {it.item?.descripcion && (
                      <p className="text-xs text-neutral-500 mt-0.5">{it.item.descripcion}</p>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Comentario del asesor */}
                {it.comentario_asesor && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                    </svg>
                    <p className="text-sm text-amber-800">{it.comentario_asesor}</p>
                  </div>
                )}

                {it.item?.permite_archivo && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2.5">
                    {/* Lista de archivos subidos */}
                    {hayDocs ? (
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <DocumentoChip
                            key={doc.id_documento}
                            doc={doc}
                            canDelete={!itemAprobado && (doc.estado_revision || "").toUpperCase() !== "APROBADO"}
                            onDelete={handleEliminarDocumento}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-1">
                        <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
                        <span className="text-sm text-neutral-400">Sin archivos aún</span>
                      </div>
                    )}

                    {/* Botón subir */}
                    {!itemAprobado && (
                      <div className="flex justify-end pt-1">
                        <BotonSubirDocumento solicitudId={idSolicitud} item={it} onUploaded={cargarTodo} />
                      </div>
                    )}
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
