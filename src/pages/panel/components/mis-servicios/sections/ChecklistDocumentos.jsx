// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import BotonSubirDocumento from "../../checklist/BotonSubirDocumento";
import { badgeEstadoItemChecklist } from "../utils";

export default function ChecklistDocumentos({ checklist, cargarTodo, idSolicitud }) {
  const grupos = {};
  (checklist || []).forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });

  const hayGrupos = Object.keys(grupos).length > 0;
  const multiGrupo = Object.keys(grupos).length > 1;

  return (
    <section className="border border-neutral-200 rounded-xl bg-white h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-neutral-100 shrink-0">
        <h3 className="text-sm font-bold text-neutral-800">1. Documentos requeridos</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5">Sube los archivos del checklist del servicio.</p>
      </div>

      {/* Lista con scroll */}
      <div className="flex-1 min-h-0 overflow-auto px-3 py-2 space-y-3">
        {!hayGrupos && (
          <p className="text-xs text-neutral-400 py-4 text-center">Aún no hay checklist configurado.</p>
        )}

        {Object.entries(grupos).map(([nombre, items]) => (
          <div key={nombre}>
            {multiGrupo && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5 px-1">
                {nombre}
              </p>
            )}

            <div className="space-y-1.5">
              {items.map((it) => {
                const docs = it.documentos || [];
                const hayDocs = docs.length > 0;

                return (
                  <div
                    key={it.id_solicitud_item}
                    className="border border-neutral-100 rounded-lg px-2.5 py-2 bg-neutral-50/60 hover:bg-white transition-colors"
                  >
                    {/* Fila: nombre + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-800 leading-snug truncate">
                          {it.item?.nombre_item}
                        </p>
                        {it.item?.descripcion && (
                          <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                            {it.item.descripcion}
                          </p>
                        )}
                      </div>
                      <span
                        className={
                          "shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none " +
                          badgeEstadoItemChecklist(it.estado_item)
                        }
                      >
                        {(it.estado_item || "pendiente")
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>

                    {/* Comentario asesor */}
                    {it.comentario_asesor && (
                      <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1.5">
                        💬 {it.comentario_asesor}
                      </p>
                    )}

                    {/* Archivos + botón subir */}
                    {it.item?.permite_archivo && (
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <span className={`text-[10px] font-medium ${hayDocs ? "text-emerald-600" : "text-neutral-400"}`}>
                          {hayDocs
                            ? `✓ ${docs.length} archivo${docs.length > 1 ? "s" : ""}`
                            : "Sin archivos"}
                        </span>
                        <BotonSubirDocumento
                          solicitudId={idSolicitud}
                          item={it}
                          onUploaded={cargarTodo}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
