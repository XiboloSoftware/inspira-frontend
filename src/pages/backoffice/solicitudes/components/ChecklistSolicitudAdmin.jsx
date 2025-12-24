// src/pages/backoffice/solicitudes/components/ChecklistSolicitudAdmin.jsx
import { boPATCH } from "../../../../services/backofficeApi";
import { API_URL, formatearFecha } from "../utils";

export default function ChecklistSolicitudAdmin({
  detalle,
  checklistPorEtapa,
  setChecklist, // opcional si quieres actualizar localmente
  recargar,     // function cargar()
}) {
  async function cambiarRevision(doc, nuevoEstado) {
    if (!doc) return;

    let comentario = "";
    if (nuevoEstado === "OBSERVADO") {
      comentario = window.prompt(
        "Comentario para el cliente (por qué se observa el documento):",
        doc.comentario_revision || ""
      );
      if (comentario === null) return;
    }

    try {
      const r = await boPATCH(`/api/admin/documentos/${doc.id_documento}/revision`, {
        estado_revision: nuevoEstado,
        comentario_revision: comentario || null,
      });

      if (!r.ok) {
        window.alert(r.message || r.msg || "No se pudo actualizar el estado del documento.");
        return;
      }

      // Más simple y consistente: recargar todo (evita bugs si son múltiples docs)
      await recargar();
    } catch (e) {
      console.error(e);
      window.alert("Error al actualizar el documento.");
    }
  }

  async function descargarDocumento(doc) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) return alert("No existe sesión de backoffice");

      const resp = await fetch(`${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) return alert("No se pudo descargar el archivo");

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nombre_original || "archivo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al descargar");
    }
  }

  async function subirDocumentoInterno(it) {
    if (!detalle) return;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "application/pdf,image/*,.doc,.docx,.xls,.xlsx";

    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("archivos", f));

        const token = localStorage.getItem("bo_token");
        const resp = await fetch(
          `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/items/${it.id_solicitud_item}/documento`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        const r = await resp.json();
        if (!resp.ok || !r.ok) {
          alert(r.msg || "No se pudo subir");
          return;
        }

        await recargar();
      } catch (err) {
        console.error(err);
        alert("Error al subir documentos");
      } finally {
        e.target.value = "";
      }
    };

    input.click();
  }

  return (
    <div className="space-y-4">
      {Object.keys(checklistPorEtapa).length === 0 && (
        <p className="text-sm text-neutral-500">Esta solicitud no tiene checklist configurado.</p>
      )}

      {Object.entries(checklistPorEtapa).map(([nombreEtapa, items]) => (
        <section key={nombreEtapa} className="border border-neutral-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-neutral-900 mb-2">{nombreEtapa}</h3>

          <div className="space-y-2">
            {items.map((it) => {
              const docs = Array.isArray(it.documentos) ? it.documentos : (it.documento ? [it.documento] : []);

              return (
                <div
                  key={it.id_solicitud_item}
                  className="border border-neutral-200 rounded-md p-2 text-xs space-y-1"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-800">{it.item?.nombre_item}</p>
                      {it.item?.descripcion && (
                        <p className="text-[11px] text-neutral-500">{it.item.descripcion}</p>
                      )}
                      {it.comentario_asesor && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5 mt-1">
                          Comentario previo: {it.comentario_asesor}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 text-neutral-700 shrink-0">
                      {(it.estado_item || "pendiente").replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-1 space-y-1">
                    {docs.length === 0 && (
                      <p className="text-[11px] text-neutral-400">Sin documentos cargados.</p>
                    )}

                    {docs.length > 0 && (
                      <div className="border-t border-neutral-100 pt-2 mt-2 space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id_documento}
                            className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] text-neutral-800 truncate">
                                {doc.nombre_original}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                Subido: {formatearFecha(doc.fecha_subida)} · Estado: {doc.estado_revision}
                              </p>
                              {doc.comentario_revision && (
                                <p className="text-[10px] text-neutral-600">
                                  Comentario: {doc.comentario_revision}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 justify-end shrink-0">
                              <button
                                type="button"
                                onClick={() => descargarDocumento(doc)}
                                className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
                              >
                                Descargar
                              </button>

                              <button
                                type="button"
                                onClick={() => cambiarRevision(doc, "APROBADO")}
                                className="text-[11px] px-2 py-1 rounded-md border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                              >
                                Aprobar
                              </button>

                              <button
                                type="button"
                                onClick={() => cambiarRevision(doc, "OBSERVADO")}
                                className="text-[11px] px-2 py-1 rounded-md border border-amber-500 text-amber-700 hover:bg-amber-50"
                              >
                                Observar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {it.item?.permite_archivo && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => subirDocumentoInterno(it)}
                          className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
                        >
                          Subir / cambiar documento (interno)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
