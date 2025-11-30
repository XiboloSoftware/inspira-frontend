import { useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";
import { navigate } from "../../../services/navigate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SolicitudDetalleAdmin({ idSolicitud }) {
  const [solicitud, setSolicitud] = useState(null);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingEstado, setSavingEstado] = useState(false);
  const [savingDoc, setSavingDoc] = useState({});

  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/solicitudes/${idSolicitud}`);
    if (r.ok) {
      setSolicitud(r.solicitud);
      setEstados(r.estados || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, [idSolicitud]);

  async function handleCambiarEstado(e) {
    const id_estado = Number(e.target.value || 0);
    if (!id_estado) return;

    setSavingEstado(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${idSolicitud}/estado`,
      { id_estado }
    );
    if (r.ok && r.solicitud) {
      setSolicitud((prev) => ({
        ...prev,
        estado: r.solicitud.estado || prev.estado,
        id_estado_actual:
          r.solicitud.id_estado_actual ?? prev.id_estado_actual,
      }));
    }
    setSavingEstado(false);
  }

  async function handleDescargarDocumento(doc) {
    const token = localStorage.getItem("bo_token");
    try {
      const res = await fetch(
        `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) return;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nombre_original || `documento-${doc.id_documento}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRevisarDocumento(doc, estado_revision) {
    const comentario_revision = window.prompt(
      "Comentario para el documento (opcional):",
      doc.comentario_revision || ""
    );

    setSavingDoc((prev) => ({ ...prev, [doc.id_documento]: true }));

    const r = await boPATCH(
      `/api/admin/documentos/${doc.id_documento}/revision`,
      { estado_revision, comentario_revision }
    );

    if (r.ok && r.documento) {
      setSolicitud((prev) => ({
        ...prev,
        checklist_items: prev.checklist_items.map((item) => ({
          ...item,
          documentos: item.documentos.map((d) =>
            d.id_documento === doc.id_documento ? r.documento : d
          ),
        })),
      }));
    }

    setSavingDoc((prev) => ({ ...prev, [doc.id_documento]: false }));
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button
          className="text-sm text-primary mb-4"
          onClick={() => navigate("/backoffice/solicitudes")}
        >
          ← Volver al listado
        </button>
        <p className="text-sm text-neutral-600">Cargando solicitud…</p>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button
          className="text-sm text-primary mb-4"
          onClick={() => navigate("/backoffice/solicitudes")}
        >
          ← Volver al listado
        </button>
        <p className="text-sm text-red-600">
          No se encontró la solicitud indicada.
        </p>
      </div>
    );
  }

  const currentEstadoId =
    solicitud.id_estado_actual || solicitud.estado?.id_estado || "";

  const checklistItems = solicitud.checklist_items || [];

  return (
    <div className="max-w-6xl mx-auto">
      <button
        className="text-sm text-primary mb-4"
        onClick={() => navigate("/backoffice/solicitudes")}
      >
        ← Volver al listado
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-semibold text-primary mb-1">
              Solicitud #{solicitud.id_solicitud} ·{" "}
              {solicitud.titulo || solicitud.tipo?.nombre || "Sin título"}
            </h1>
            <p className="text-sm text-neutral-700">
              Cliente:{" "}
              {solicitud.cliente
                ? `${solicitud.cliente.nombre} <${solicitud.cliente.email_contacto || ""}>`
                : "N/D"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Origen: {solicitud.origen || "N/D"} ·{" "}
              {new Date(solicitud.fecha_creacion).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <label className="block text-xs text-neutral-500 mb-1">
              Estado global de la solicitud
            </label>
            <select
              className="text-sm border border-neutral-300 rounded-lg px-2 py-1"
              value={currentEstadoId}
              onChange={handleCambiarEstado}
              disabled={savingEstado}
            >
              <option value="">Seleccionar estado…</option>
              {estados.map((e) => (
                <option key={e.id_estado} value={e.id_estado}>
                  {e.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Actual: {solicitud.estado?.nombre || "Sin estado"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">
          Checklist y documentos
        </h2>

        {checklistItems.length === 0 && (
          <p className="text-sm text-neutral-500">
            Este servicio todavía no tiene checklist asociado.
          </p>
        )}

        <div className="space-y-4">
          {checklistItems.map((item) => (
            <div
              key={item.id_solicitud_item}
              className="border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.item?.nombre_item || "Ítem de checklist"}
                  </p>
                  {item.item?.descripcion && (
                    <p className="text-xs text-neutral-500">
                      {item.item.descripcion}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    Estado ítem:{" "}
                    <span className="font-medium">{item.estado_item}</span>
                    {item.comentario_asesor && (
                      <> · {item.comentario_asesor}</>
                    )}
                  </p>
                </div>
              </div>

              {(!item.documentos || item.documentos.length === 0) && (
                <p className="text-xs text-neutral-500">
                  Aún no hay documentos subidos para este ítem.
                </p>
              )}

              {item.documentos && item.documentos.length > 0 && (
                <div className="space-y-2">
                  {item.documentos.map((doc) => (
                    <div
                      key={doc.id_documento}
                      className="flex justify-between items-center border border-neutral-100 rounded-md px-2 py-1"
                    >
                      <div className="text-xs">
                        <p className="font-medium text-neutral-800">
                          {doc.nombre_original}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Estado: {doc.estado_revision} · subida{" "}
                          {doc.fecha_subida
                            ? new Date(doc.fecha_subida).toLocaleString()
                            : ""}
                        </p>
                        {doc.comentario_revision && (
                          <p className="text-[11px] text-neutral-500">
                            Comentario: {doc.comentario_revision}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-[11px] px-2 py-1 border border-neutral-300 rounded-md"
                          onClick={() => handleDescargarDocumento(doc)}
                        >
                          Descargar
                        </button>
                        <button
                          className="text-[11px] px-2 py-1 border border-emerald-400 rounded-md"
                          disabled={savingDoc[doc.id_documento]}
                          onClick={() =>
                            handleRevisarDocumento(doc, "APROBADO")
                          }
                        >
                          Aprobar
                        </button>
                        <button
                          className="text-[11px] px-2 py-1 border border-amber-400 rounded-md"
                          disabled={savingDoc[doc.id_documento]}
                          onClick={() =>
                            handleRevisarDocumento(doc, "OBSERVADO")
                          }
                        >
                          Observar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
