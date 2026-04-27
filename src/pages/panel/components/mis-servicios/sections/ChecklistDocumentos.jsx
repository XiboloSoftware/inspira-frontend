// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import BotonSubirDocumento from "../../checklist/BotonSubirDocumento";
import { badgeEstadoItemChecklist } from "../utils";

const ESTADO_CONFIG = {
  aprobado:  { icon: "✓", label: "Aprobado",   bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  enviado:   { icon: "↑", label: "Enviado",    bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
  observado: { icon: "!", label: "Observado",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
  no_aplica: { icon: "—", label: "No aplica",  bg: "bg-neutral-50", text: "text-neutral-500", border: "border-neutral-200", dot: "bg-neutral-400" },
  pendiente: { icon: "○", label: "Pendiente",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
};

function getEstadoConfig(estado) {
  const key = (estado || "pendiente").toLowerCase().replace(" ", "_");
  return ESTADO_CONFIG[key] || ESTADO_CONFIG.pendiente;
}

export default function ChecklistDocumentos({ checklist, cargarTodo, idSolicitud }) {
  const grupos = {};
  (checklist || []).forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });

  const hayGrupos = Object.keys(grupos).length > 0;
  const multiGrupo = Object.keys(grupos).length > 1;

  const total = checklist.length;
  const aprobados = checklist.filter((it) =>
    ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
  ).length;

  return (
    <section className="border border-neutral-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-neutral-100 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#023A4B] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">Documentos requeridos</h3>
            </div>
            <p className="text-sm text-neutral-500 ml-9">Sube los archivos del checklist de tu servicio.</p>
          </div>
          {total > 0 && (
            <span className="shrink-0 text-sm font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">
              {aprobados}/{total} listos
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="px-6 py-4 space-y-4">
        {!hayGrupos && (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-400">Aún no hay checklist configurado.</p>
          </div>
        )}

        {Object.entries(grupos).map(([nombre, items]) => (
          <div key={nombre}>
            {multiGrupo && (
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 pb-2 border-b border-neutral-100">
                {nombre}
              </p>
            )}

            <div className="space-y-3">
              {items.map((it) => {
                const docs = it.documentos || [];
                const hayDocs = docs.length > 0;
                const cfg = getEstadoConfig(it.estado_item);

                return (
                  <div
                    key={it.id_solicitud_item}
                    className={`border rounded-xl p-4 transition-all ${
                      it.estado_item === "observado"
                        ? "border-red-200 bg-red-50/30"
                        : it.estado_item === "aprobado"
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Fila principal */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900 leading-snug">
                          {it.item?.nombre_item}
                        </p>
                        {it.item?.descripcion && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {it.item.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Badge de estado */}
                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Comentario del asesor */}
                    {it.comentario_asesor && (
                      <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                        <span className="text-amber-500 text-base shrink-0 mt-0.5">💬</span>
                        <p className="text-sm text-amber-800">{it.comentario_asesor}</p>
                      </div>
                    )}

                    {/* Archivos + botón subir */}
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
