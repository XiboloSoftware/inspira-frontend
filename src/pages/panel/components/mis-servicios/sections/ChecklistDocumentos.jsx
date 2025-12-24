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

  return (
  <section className="border rounded-lg p-3 h-full flex flex-col">
    <h3 className="text-sm font-semibold mb-2">1. Documentos requeridos</h3>
    <p className="text-xs text-neutral-500 mb-2">Aquí verás el checklist del servicio.</p>

      {Object.keys(grupos).length === 0 && (
        <p className="text-xs text-neutral-500">Aún no hay checklist configurado.</p>
      )}

    <div className="space-y-3 flex-1 min-h-0 overflow-auto pr-1">
        {Object.entries(grupos).map(([nombre, items]) => (
          <div key={nombre} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase">{nombre}</p>

            {items.map((it) => {
              const docs = it.documentos || [];
              return (
                <div
                  key={it.id_solicitud_item}
                  className="border rounded-md p-2 text-xs flex flex-col gap-1"
                >
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{it.item?.nombre_item}</p>
                      {it.item?.descripcion && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2">
                          {it.item.descripcion}
                        </p>
                      )}
                    </div>

                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-[11px] shrink-0 " +
                        badgeEstadoItemChecklist(it.estado_item)
                      }
                    >
                      {(it.estado_item || "pendiente")
                        .replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>

                  {it.comentario_asesor && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border rounded px-2 py-0.5">
                      Comentario del asesor: {it.comentario_asesor}
                    </p>
                  )}

                  {it.item?.permite_archivo && (
                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start">
                      {/* Izquierda: info docs */}
                      <div className="min-w-0">
                        {docs.length > 0 ? (
                          <div className="text-[11px] text-neutral-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Documentos cargados</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                                {docs.length}
                              </span>
                            </div>

                            <ul className="mt-1 space-y-1">
                              {docs.map((d) => (
                                <li
                                  key={d.id_documento}
                                  className="flex items-center gap-2 border rounded-md px-2 py-1 bg-neutral-50"
                                >
                                  <span className="truncate">{d.nombre_original}</span>
                                  <span className="ml-auto text-[10px] text-neutral-400 shrink-0">
                                    {d.estado_revision}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400">
                            Sin archivo cargado
                          </span>
                        )}
                      </div>

                      {/* Derecha: botón */}
                      <div className="shrink-0">
                        <BotonSubirDocumento
                          solicitudId={idSolicitud}
                          item={it}
                          onUploaded={cargarTodo}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
