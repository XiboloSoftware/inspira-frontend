// src/pages/backoffice/solicitudes/components/ChecklistSolicitudAdmin.jsx
import { useState } from "react";
import { boPATCH } from "../../../../services/backofficeApi";
import { API_URL, formatearFecha } from "../utils";
import DocViewer from "../../documentos/DocViewer";

const ESTADO_CFG = {
  aprobado:  { label: "Aprobado",  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  enviado:   { label: "Enviado",   bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     dot: "bg-sky-500"     },
  observado: { label: "Observado", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
  no_aplica: { label: "No aplica", bg: "bg-neutral-50", text: "text-neutral-500", border: "border-neutral-200", dot: "bg-neutral-400" },
  pendiente: { label: "Pendiente", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
};

function getEstadoCfg(estado) {
  return ESTADO_CFG[(estado || "pendiente").toLowerCase()] || ESTADO_CFG.pendiente;
}

export default function ChecklistSolicitudAdmin({
  detalle,
  checklistPorEtapa,
  setChecklist,
  recargar,
}) {
  const [viewingDoc, setViewingDoc] = useState(null);

  async function abrirEnDrive(doc) {
    try {
      const token = localStorage.getItem("bo_token");
      const r = await fetch(`${API_URL}/api/admin/documentos/${doc.id_documento}/drive-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.ok && data.url) window.open(data.url, "_blank");
      else alert(data.msg || "No disponible en Drive aún");
    } catch {
      alert("Error al obtener URL de Drive");
    }
  }

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
      if (!r.ok) { window.alert(r.message || r.msg || "No se pudo actualizar el estado del documento."); return; }
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
          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
        );
        const r = await resp.json();
        if (!resp.ok || !r.ok) { alert(r.msg || "No se pudo subir"); return; }
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

  if (Object.keys(checklistPorEtapa).length === 0) {
    return <p className="text-sm text-neutral-500 py-2">Esta solicitud no tiene checklist configurado.</p>;
  }

  return (
    <>
    <div className="space-y-5">
      {Object.entries(checklistPorEtapa).map(([nombreEtapa, items]) => (
        <div key={nombreEtapa}>
          {Object.keys(checklistPorEtapa).length > 1 && (
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 pb-2 mb-3 border-b border-neutral-100">
              {nombreEtapa}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 items-start">
            {items.map((it) => {
              const docs = Array.isArray(it.documentos)
                ? it.documentos
                : it.documento ? [it.documento] : [];
              const cfg = getEstadoCfg(it.estado_item);
              const borderColor =
                it.estado_item === "observado" ? "border-red-200 bg-red-50/30" :
                it.estado_item === "aprobado"  ? "border-emerald-200 bg-emerald-50/20" :
                "border-neutral-200 bg-white hover:border-neutral-300";

              return (
                <div
                  key={it.id_solicitud_item}
                  className={`border rounded-xl p-3 transition-all min-h-[88px] ${borderColor}`}
                >
                  {/* Header del item */}
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 leading-snug">
                        {it.item?.nombre_item}
                      </p>
                      {it.item?.descripcion && (
                        <p className="text-xs text-neutral-500 mt-0.5">{it.item.descripcion}</p>
                      )}
                      {it.comentario_asesor && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 mt-1.5">
                          Comentario previo: {it.comentario_asesor}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Documentos */}
                  {docs.length === 0 ? (
                    <p className="text-[11px] text-neutral-400 mt-1">Sin documentos cargados.</p>
                  ) : (
                    <div className="border-t border-neutral-100 pt-2 mt-2 space-y-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.id_documento}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-start"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-800 truncate font-medium">{doc.nombre_original}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Subido: {formatearFecha(doc.fecha_subida)} · Estado:{" "}
                              <span className="font-medium">{doc.estado_revision}</span>
                            </p>
                            {doc.comentario_revision && (
                              <p className="text-[11px] text-neutral-600 mt-0.5">
                                Comentario: {doc.comentario_revision}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 justify-end shrink-0 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setViewingDoc(doc)}
                              className="text-[11px] px-2 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition"
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              title="Abrir en Google Drive"
                              onClick={() => abrirEnDrive(doc)}
                              className="group flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-md active:scale-95 transition-all duration-150 shrink-0"
                            >
                              <svg width="13" height="13" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>
                                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335"/>
                                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                              </svg>
                              <span className="text-neutral-500 group-hover:text-neutral-800 transition-colors font-medium">Drive</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => descargarDocumento(doc)}
                              className="text-[11px] px-2 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition"
                            >
                              Descargar
                            </button>
                            <button
                              type="button"
                              onClick={() => cambiarRevision(doc, "APROBADO")}
                              className="text-[11px] px-2 py-1 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              onClick={() => cambiarRevision(doc, "OBSERVADO")}
                              className="text-[11px] px-2 py-1 rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-50 transition"
                            >
                              Observar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subir (interno) */}
                  {it.item?.permite_archivo && (
                    <div className="flex justify-end mt-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => subirDocumentoInterno(it)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-neutral-300 hover:bg-neutral-50 transition"
                      >
                        Subir / cambiar documento (interno)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    {viewingDoc && <DocViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    </>
  );
}
