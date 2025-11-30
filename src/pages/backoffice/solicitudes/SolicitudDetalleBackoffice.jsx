// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useEffect, useMemo, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function formatearFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString();
}

export default function SolicitudDetalleBackoffice({ idSolicitud, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      // GET /api/admin/solicitudes/:idSolicitud/checklist
      const r = await boGET(`/api/admin/solicitudes/${idSolicitud}/checklist`);
      if (!r.ok) {
        setError(
          r.message || r.msg || "No se pudo cargar la solicitud."
        );
        return;
      }
      setDetalle(r.solicitud);
      setChecklist(r.checklist || []);
    } catch (e) {
      console.error(e);
      setError("Error al cargar la información de la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  const checklistPorEtapa = useMemo(() => {
    const grupos = {};
    (checklist || []).forEach((it) => {
      const etapa = it.item?.etapa?.nombre || "Checklist";
      if (!grupos[etapa]) grupos[etapa] = [];
      grupos[etapa].push(it);
    });
    return grupos;
  }, [checklist]);

  async function cambiarRevision(doc, nuevoEstado) {
    if (!doc) return;

    let comentario = "";
    if (nuevoEstado === "OBSERVADO") {
      comentario = window.prompt(
        "Comentario para el cliente (por qué se observa el documento):",
        doc.comentario_revision || ""
      );
      if (comentario === null) return; // canceló
    }

    try {
      const r = await boPATCH(
        `/api/admin/documentos/${doc.id_documento}/revision`,
        {
          estado_revision: nuevoEstado,
          comentario_revision: comentario || null,
        }
      );

      if (!r.ok) {
        window.alert(
          r.message ||
            r.msg ||
            "No se pudo actualizar el estado del documento."
        );
        return;
      }

      const actualizado = r.documento;

      // Actualizar en memoria: recuerda que ahora es `documento` (singular)
      setChecklist((prev) =>
        prev.map((it) =>
          it.documento && it.documento.id_documento === actualizado.id_documento
            ? { ...it, documento: actualizado }
            : it
        )
      );
    } catch (e) {
      console.error(e);
      window.alert("Error al actualizar el documento.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-neutral-600">Cargando solicitud…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={onVolver}
          className="text-xs text-primary hover:underline mb-3"
        >
          ← Volver a solicitudes
        </button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!detalle) return null;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        type="button"
        onClick={onVolver}
        className="text-xs text-[#023A4B] hover:underline mb-2"
      >
        ← Volver a solicitudes
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        {/* Encabezado */}
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Solicitud #{detalle.id_solicitud}
          </p>
          <h2 className="text-lg font-semibold text-neutral-900">
            {detalle.titulo || "(Sin título)"}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Cliente:{" "}
            {detalle.cliente?.nombre
              ? `${detalle.cliente.nombre} <${detalle.cliente.email_contacto || ""}>`
              : "N/D"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Creada el {formatearFecha(detalle.fecha_creacion)}
            {detalle.fecha_cierre && (
              <>
                {" · "}Cerrada el {formatearFecha(detalle.fecha_cierre)}
              </>
            )}
          </p>
        </div>

        {/* Checklist y documentos */}
        <div className="space-y-4">
          {Object.keys(checklistPorEtapa).length === 0 && (
            <p className="text-sm text-neutral-500">
              Esta solicitud no tiene checklist configurado.
            </p>
          )}

          {Object.entries(checklistPorEtapa).map(([nombreEtapa, items]) => (
            <section
              key={nombreEtapa}
              className="border border-neutral-200 rounded-lg p-3"
            >
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                {nombreEtapa}
              </h3>

              <div className="space-y-2">
                {items.map((it) => {
                  const doc = it.documento || null;

                  return (
                    <div
                      key={it.id_solicitud_item}
                      className="border border-neutral-200 rounded-md p-2 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-neutral-800">
                            {it.item?.nombre_item}
                          </p>
                          {it.item?.descripcion && (
                            <p className="text-[11px] text-neutral-500">
                              {it.item.descripcion}
                            </p>
                          )}
                          {it.comentario_asesor && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5 mt-1">
                              Comentario previo: {it.comentario_asesor}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 text-neutral-700">
                          {(it.estado_item || "pendiente")
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-1 space-y-1">
                        {!doc && (
                          <p className="text-[11px] text-neutral-400">
                            Sin documentos cargados.
                          </p>
                        )}

                        {doc && (
                          <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-1 mt-1">
                            <div className="flex flex-col">
                              <span className="text-[11px] text-neutral-800">
                                {doc.nombre_original}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                Subido: {formatearFecha(doc.fecha_subida)} ·{" "}
                                Estado: {doc.estado_revision}
                              </span>
                              {doc.comentario_revision && (
                                <span className="text-[10px] text-neutral-600">
                                  Comentario: {doc.comentario_revision}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* URL de descarga construida aquí */}
                              <a
                                href={`${API_URL}/api/documentos/${doc.id_documento}/descargar`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
                              >
                                Descargar
                              </a>

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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
