// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useEffect, useMemo, useState } from "react";
import { boGET, boPATCH, boUpload } from "../../../services/backofficeApi";
import FormularioDatosAcademicosAdmin from "./FormularioDatosAcademicosAdmin";
import EleccionMastersAdmin from "./EleccionMastersAdmin";
import ProgramacionPostulacionesAdmin from "./ProgramacionPostulacionesAdmin";
import PortalesYJustificantesAdmin from "./PortalesYJustificantesAdmin";
import CierreServicioMasterAdmin from "./CierreServicioMasterAdmin";
import AsesoresAsignadosAdmin from "./AsesoresAsignadosAdmin";

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
  const [subiendoInforme, setSubiendoInforme] = useState(false);

  // asesores
  const [asesoresDisponibles, setAsesoresDisponibles] = useState([]);
  const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);
  const [guardandoAsesores, setGuardandoAsesores] = useState(false);

  // =========================================
  // CARGA DE DATOS
  // =========================================

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      // 1) Checklist + solicitud (API admin)
      const rChecklist = await boGET(
        `/api/admin/solicitudes/${idSolicitud}/checklist`
      );
      if (!rChecklist.ok) {
        setError(
          rChecklist.message ||
          rChecklist.msg ||
          "No se pudo cargar la solicitud."
        );
        return;
      }

      // 2) Detalle de backoffice con asesores
      const rBackoffice = await boGET(`/backoffice/solicitudes/${idSolicitud}`);

      let solicitud = rChecklist.solicitud || {};
      // si el endpoint de backoffice respondió bien, usamos sus asesores
      if (rBackoffice.ok && rBackoffice.solicitud) {
        solicitud = {
          ...solicitud,
          asesores: rBackoffice.solicitud.asesores || solicitud.asesores,
        };
      }

      setDetalle(solicitud);
      setChecklist(rChecklist.checklist || []);

      // Inicializar asesoresSeleccionados a partir de la solicitud combinada
      const s = solicitud;
      let seleccion = [];

      if (s.asesores && Array.isArray(s.asesores) && s.asesores.length > 0) {
        seleccion = s.asesores.map((a) =>
          String(a.usuario?.id_usuario ?? a.id_usuario)
        );
      } else if (s.asesor && s.asesor.id_usuario) {
        seleccion = [String(s.asesor.id_usuario)];
      } else if (s.id_asesor_asignado) {
        seleccion = [String(s.id_asesor_asignado)];
      }

      setAsesoresSeleccionados(seleccion);
    } catch (e) {
      console.error(e);
      setError("Error al cargar la información de la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  async function cargarAsesoresDisponibles() {
    try {
      // GET /backoffice/usuarios-internos?rol=asesor
      const r = await boGET("/backoffice/usuarios-internos?rol=asesor");
      if (r.ok) {
        setAsesoresDisponibles(r.usuarios || []);
      }
    } catch (e) {
      console.error("Error al cargar asesores disponibles", e);
    }
  }

  useEffect(() => {
    cargar();
    cargarAsesoresDisponibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  const checklistPorEtapa = useMemo(() => {
    const grupos = {};
    (checklist || []).forEach((it) => {
      const etapa = it.item?.etapa?.nombre || "Checklist";
      if (!grupos[etapa]) grupos[etapa] = [];
      grupos[etapa].push(it);
    });
    return grupos;
  }, [checklist]);

  // =========================================
  // GESTIÓN DE REVISIONES DE DOCUMENTOS
  // =========================================

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

  async function descargarDocumento(doc) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) return alert("No existe sesión de backoffice");

      const resp = await fetch(
        `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

      // necesitas un helper boUploadForm o usar fetch directo:
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

      await cargar();
    } catch (err) {
      console.error(err);
      alert("Error al subir documentos");
    } finally {
      e.target.value = "";
    }
  };

  input.click();
}



  // =========================================
  // GESTIÓN DE INFORME
  // =========================================

  async function handleUploadInforme(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoInforme(true);

    try {
      const r = await boUpload(
        `/api/admin/solicitudes/${detalle.id_solicitud}/informe`,
        file
      );
      if (!r.ok) {
        alert(r.msg || "No se pudo subir el informe");
        return;
      }
      await cargar();
    } finally {
      setSubiendoInforme(false);
    }
  }

  async function manejarInformeAdmin(modo) {
    if (!detalle) return;
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) return alert("No existe sesión de backoffice");

      const resp = await fetch(
        `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/informe${modo === "ver" ? "?view=1" : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!resp.ok) return alert("No se pudo obtener el informe");

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = detalle.informe_nombre_original || "informe";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al abrir/descargar el informe");
    }
  }

  // =========================================
  // GESTIÓN DE ASESORES (PATCH)
  // =========================================

  async function handleGuardarAsesores() {
    if (!detalle) return;
    setGuardandoAsesores(true);
    try {
      const body = {
        ids_asesores: asesoresSeleccionados.map((id) => Number(id)),
      };

      const r = await boPATCH(
        `/backoffice/solicitudes/${detalle.id_solicitud}/asesores`,
        body
      );

      if (!r.ok) {
        alert(r.msg || "No se pudieron guardar los asesores");
        return;
      }

      setDetalle((prev) => ({
        ...prev,
        asesores: r.solicitud.asesores || [],
      }));

      alert("Asesores actualizados correctamente");
    } catch (e) {
      console.error(e);
      alert("Error al guardar asesores");
    } finally {
      setGuardandoAsesores(false);
    }
  }

  // =========================================
  // RENDER
  // =========================================

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
              ? `${detalle.cliente.nombre} <${detalle.cliente.email_contacto || ""
              }>`
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

          {/* Bloque de asesores */}
          <AsesoresAsignadosAdmin
            asesoresDisponibles={asesoresDisponibles}
            asesoresSeleccionados={asesoresSeleccionados}
            onChangeSeleccionados={setAsesoresSeleccionados}
            onGuardar={handleGuardarAsesores}
            guardando={guardandoAsesores}
          />
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
                                Subido: {formatearFecha(doc.fecha_subida)} · Estado: {doc.estado_revision}
                              </span>
                              {doc.comentario_revision && (
                                <span className="text-[10px] text-neutral-600">
                                  Comentario: {doc.comentario_revision}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
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
                        )}

                        {/* 👇 NUEVO: botón para subir/cambiar documento como admin/asesor */}
                        {it.item?.permite_archivo && (
                          <div className="flex justify-end mt-1">
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

        {/* Formulario de datos académicos */}
        <section className="border border-neutral-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-2">
            Formulario de datos académicos
          </h3>
          <FormularioDatosAcademicosAdmin datos={detalle.datos_formulario} />
        </section>

        {/* Informe de búsqueda de másteres */}
        <section className="border border-neutral-200 rounded-lg p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              4. Informe de búsqueda de másteres
            </h3>

            <div className="flex items-center gap-2">
              {detalle.informe_fecha_subida && (
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                  Informe subido el{" "}
                  {formatearFecha(detalle.informe_fecha_subida)}
                </span>
              )}

              <label className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer">
                {subiendoInforme ? "Subiendo…" : "Subir / reemplazar informe"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
                  onChange={handleUploadInforme}
                />
              </label>
            </div>
          </div>

          {!detalle.informe_fecha_subida ? (
            <p className="text-xs text-neutral-500">
              Aún no se ha subido el informe de búsqueda de másteres para esta
              solicitud. Cuando lo generes, súbelo aquí para que el cliente
              pueda verlo.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs text-neutral-700">
                <p className="font-medium">
                  {detalle.informe_nombre_original || "Informe de búsqueda"}
                </p>
                <p className="text-neutral-500">
                  Última actualización:{" "}
                  {formatearFecha(detalle.informe_fecha_subida)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => manejarInformeAdmin("ver")}
                  className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
                >
                  Ver informe
                </button>
                <button
                  type="button"
                  onClick={() => manejarInformeAdmin("descargar")}
                  className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]"
                >
                  Descargar informe
                </button>
              </div>
            </div>
          )}
        </section>

        {/* BLOQUE 5: Elección de másteres */}
        <section className="border border-neutral-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-neutral-900 mb-2">
            5. Elección de másteres (cliente)
          </h3>
          <p className="text-xs text-neutral-500 mb-2">
            Másteres que el cliente ha seleccionado y ordenado por prioridad
            después de revisar el informe.
          </p>
          <EleccionMastersAdmin elecciones={detalle.eleccion_masters} />
        </section>

        {/* BLOQUE 6: Programación de postulaciones */}
        <ProgramacionPostulacionesAdmin idSolicitud={detalle.id_solicitud} />

        {/* BLOQUE 7: Portales, claves y justificantes */}
        <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />

        {/* BLOQUE 8: Cierre */}
        <CierreServicioMasterAdmin idSolicitud={detalle.id_solicitud} />
      </div>
    </div>
  );
}
