// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import BotonSubirDocumento from "../../checklist/BotonSubirDocumento";
import { badgeEstadoItemChecklist } from "../utils";

export default function ChecklistDocumentos({ checklist, cargarTodo, idSolicitud }) {
  const grupos = {};
  checklist.forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });

  return (
    <section className="border rounded-lg p-3">
      <h3 className="text-sm font-semibold mb-2">1. Documentos requeridos</h3>
      <p className="text-xs text-neutral-500 mb-2">
        Aquí verás el checklist del servicio.
      </p>

      {Object.keys(grupos).length === 0 && (
        <p className="text-xs text-neutral-500">Aún no hay checklist configurado.</p>
      )}

      <div className="space-y-3 max-h-72 overflow-auto pr-1">
        {Object.entries(grupos).map(([nombre, items]) => (
          <div key={nombre} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase">{nombre}</p>

            {items.map((it) => (
              <div
                key={it.id_solicitud_item}
                className="border rounded-md p-2 text-xs flex flex-col gap-1"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{it.item?.nombre_item}</p>
                    {it.item?.descripcion && (
                      <p className="text-[11px] text-neutral-500">
                        {it.item.descripcion}
                      </p>
                    )}
                  </div>

                  <span className={"px-2 py-0.5 rounded-full text-[11px] " +
                    badgeEstadoItemChecklist(it.estado_item)
                  }>
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
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {["enviado", "aprobado", "observado", "no_aplica"].includes(
                        (it.estado_item || "").toLowerCase()
                      ) ? (
                        <span className="text-[11px] text-neutral-600">
                          Documento enviado ({it.estado_item})
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">
                          Sin archivo cargado
                        </span>
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
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
