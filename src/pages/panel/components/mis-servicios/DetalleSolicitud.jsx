// src/pages/panel/components/mis-servicios/DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import BotonSubirDocumento from "../checklist/BotonSubirDocumento";
import { apiGET, apiPATCH, apiPOST } from "../../../../services/api";
import { INSTRUCTIVOS_POR_TIPO } from "./constants";
import {
  formatearFecha,
  badgeEstadoSolicitud,
  badgeEstadoItemChecklist,
} from "./utils";

export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({
    universidad_origen: "",
    grado_academico: "",
    carrera: "",
    universidades_destino: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      // Detalle de la solicitud
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) {
        setDetalle(rDetalle.solicitud);
      } else {
        setError(
          rDetalle.message ||
            rDetalle.msg ||
            "No se pudo cargar el detalle de la solicitud."
        );
        return;
      }

      // Checklist de documentos
      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) {
        setChecklist(rChecklist.checklist || []);
      }

      // Datos de formulario (JSON guardado en la solicitud)
      const rForm = await apiGET(`/solicitudes/${idSolicitud}/formulario`);
      if (rForm.ok && rForm.datos) {
        setFormData((prev) => ({
          ...prev,
          ...rForm.datos,
        }));
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar la información de la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  const progresoChecklist = useMemo(() => {
    if (!checklist || checklist.length === 0) return 0;
    const completados = checklist.filter((it) =>
      ["aprobado", "no_aplica"].includes(
        (it.estado_item || "").toLowerCase()
      )
    ).length;
    return Math.round((completados * 100) / checklist.length);
  }, [checklist]);

  

  async function handleSubmitFormulario(e) {
    e.preventDefault();
    setSavingForm(true);
    try {
      const r = await apiPOST(
        `/solicitudes/${idSolicitud}/formulario`,
        formData
      );
      if (!r.ok) {
        window.alert(
          r.message || r.msg || "No se pudo guardar el formulario."
        );
        return;
      }
      window.alert("Datos guardados correctamente.");
    } catch (e) {
      console.error(e);
      window.alert("Error al guardar el formulario.");
    } finally {
      setSavingForm(false);
    }
  }

  const instructivos =
    (detalle?.tipo?.nombre && INSTRUCTIVOS_POR_TIPO[detalle.tipo.nombre]) ||
    [];

  // Agrupar checklist por etapa
  const checklistPorEtapa = useMemo(() => {
    const grupos = {};
    (checklist || []).forEach((it) => {
      const etapa = it.item?.etapa?.nombre || "Checklist";
      if (!grupos[etapa]) grupos[etapa] = [];
      grupos[etapa].push(it);
    });
    return grupos;
  }, [checklist]);

  const estadoBadge = badgeEstadoSolicitud(
    detalle?.estado?.nombre,
    detalle?.estado?.es_final
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onVolver}
        className="text-xs text-[#023A4B] hover:underline"
      >
        ← Volver a mis servicios
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        {loading && <p className="text-sm text-neutral-500">Cargando…</p>}
        {!loading && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && detalle && (
          <>
            {/* Encabezado */}
            <div className="flex flex-col gap-1 mb-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Solicitud #{detalle.id_solicitud}
              </p>
              <h2 className="text-lg font-semibold text-neutral-900">
                {detalle.titulo || solicitudBase.titulo || "Servicio sin título"}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1">
                {detalle.tipo?.nombre && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {detalle.tipo.nombre}
                  </span>
                )}

                <span className={estadoBadge.classes}>
                  {estadoBadge.text}
                </span>

                <span className="text-[11px] text-neutral-500">
                  Código: {detalle.codigo_publico}
                </span>
              </div>

              <p className="text-xs text-neutral-500 mt-1">
                Creada el {formatearFecha(detalle.fecha_creacion)}
                {detalle.fecha_cierre && (
                  <>
                    {" · "}Cerrada el {formatearFecha(detalle.fecha_cierre)}
                  </>
                )}
              </p>

              {/* Progreso del checklist */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-neutral-500 mb-1">
                  <span>Progreso del checklist</span>
                  <span>{progresoChecklist}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F49E4B] transition-all"
                    style={{ width: `${progresoChecklist}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SECCIONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Documentos / checklist */}
              <section className="border border-neutral-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                  1. Documentos requeridos
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Aquí verás el checklist del servicio. Cada ítem puede tener un
                  documento asociado (PDF, Word, Excel, etc.).
                </p>

                {Object.keys(checklistPorEtapa).length === 0 && (
                  <p className="text-xs text-neutral-500">
                    Aún no hay checklist configurado para esta solicitud.
                  </p>
                )}

                <div className="space-y-3 max-h-72 overflow-auto pr-1">
                  {Object.entries(checklistPorEtapa).map(
                    ([nombreEtapa, items]) => (
                      <div key={nombreEtapa} className="space-y-1">
                        <p className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wide">
                          {nombreEtapa}
                        </p>
                        {items.map((it) => (
                          <div
                            key={it.id_solicitud_item}
                            className="border border-neutral-200 rounded-md p-2 text-xs flex flex-col gap-1"
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
                              </div>
                              <span
                                className={
                                  "px-2 py-0.5 rounded-full text-[11px] " +
                                  badgeEstadoItemChecklist(it.estado_item)
                                }
                              >
                                {(it.estado_item || "pendiente")
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            </div>

                            {it.comentario_asesor && (
                              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                                Comentario del asesor: {it.comentario_asesor}
                              </p>
                            )}

                                                        {it.item?.permite_archivo && (
                              <div className="flex justify-between items-center gap-2 mt-1">
                                <div className="flex flex-col">
                                  {["enviado", "aprobado", "observado", "no_aplica"].includes(
                                    (it.estado_item || "").toLowerCase()
                                  ) ? (
                                    <span className="text-[11px] text-neutral-600">
                                      Documento enviado ({(it.estado_item || "")
                                        .replace("_", " ")
                                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                                      )
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
                                  onUploaded={cargarTodo} // recarga checklist tras subir
                                />
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* 2. Instructivos y plantillas */}
              <section className="border border-neutral-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                  2. Instructivo y plantillas
                </h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Descarga la guía paso a paso y las plantillas recomendadas
                  para este servicio.
                </p>

                {instructivos.length === 0 && (
                  <p className="text-xs text-neutral-500">
                    Aún no hay instructivos configurados para este tipo de
                    servicio. Puedes agregarlos en el frontend editando{" "}
                    <code className="bg-neutral-100 px-1 rounded">
                      INSTRUCTIVOS_POR_TIPO
                    </code>{" "}
                    en <code>constants.js</code>.
                  </p>
                )}

                <ul className="space-y-2">
                  {instructivos.map((doc) => (
                    <li
                      key={doc.url}
                      className="flex items-center justify-between text-xs border border-neutral-200 rounded-md px-2 py-1.5"
                    >
                      <span className="text-neutral-700">{doc.label}</span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#023A4B] underline"
                      >
                        Descargar
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 3. Formulario de datos académicos */}
              <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                  3. Formulario de datos académicos
                </h3>
                <p className="text-xs text-neutral-500 mb-3">
                  Completa estos datos para que el equipo Inspira pueda
                  ayudarte a seleccionar universidades y programas.
                </p>

                <form
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  onSubmit={handleSubmitFormulario}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-700">
                      Universidad de origen
                    </label>
                    <input
                      type="text"
                      className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
                      value={formData.universidad_origen}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          universidad_origen: e.target.value,
                        }))
                      }
                      placeholder="Ej: Universidad Nacional Mayor de San Marcos"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-700">
                      Grado académico
                    </label>
                    <input
                      type="text"
                      className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
                      value={formData.grado_academico}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          grado_academico: e.target.value,
                        }))
                      }
                      placeholder="Ej: Licenciada en Enfermería"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-700">
                      Carrera / especialidad
                    </label>
                    <input
                      type="text"
                      className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
                      value={formData.carrera}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          carrera: e.target.value,
                        }))
                      }
                      placeholder="Ej: Enfermería pediátrica, salud infantil, etc."
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[11px] font-medium text-neutral-700">
                      Universidades de destino (una por línea o separadas por
                      comas)
                    </label>
                    <textarea
                      className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs min-h-[80px]"
                      value={formData.universidades_destino}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          universidades_destino: e.target.value,
                        }))
                      }
                      placeholder={
                        "Ej:\n- Universidad de Barcelona\n- Universidad de Sevilla\n- Universidad de Granada"
                      }
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-1">
                    <button
                      type="submit"
                      disabled={savingForm}
                      className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
                    >
                      {savingForm ? "Guardando..." : "Guardar formulario"}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
