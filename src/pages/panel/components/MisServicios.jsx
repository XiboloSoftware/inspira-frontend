// src/pages/panel/components/MisServicios.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPATCH, apiPOST } from "../../../services/api";

/**
 * Instructivos/plantillas por tipo de solicitud.
 * Ajusta los nombres y URLs a tus PDFs/Excels reales
 * (por ejemplo, en /public/docs/... o enlaces de Drive).
 */
const INSTRUCTIVOS_POR_TIPO = {
  "Programa Máster 360°": [
    {
      label: "Guía general del Programa Máster 360°",
      url: "/docs/master360/guia-general.pdf",
    },
    {
      label: "Plantilla CV Europeo (Word)",
      url: "/docs/comunes/plantilla-cv-europass.docx",
    },
  ],
  "Postulación en Andalucía": [
    {
      label: "Guía de pasos para Postulación en Andalucía",
      url: "/docs/andalucia/guia-pasos.pdf",
    },
    {
      label: "Plantilla de carta de motivación",
      url: "/docs/andalucia/plantilla-carta-motivacion.docx",
    },
  ],
};

function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  try {
    return new Date(fechaIso).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fechaIso;
  }
}

function badgeEstadoSolicitud(nombreEstado, esFinal) {
  if (!nombreEstado) return {
    text: "Sin estado",
    classes:
      "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200",
  };

  const n = nombreEstado.toLowerCase();

  if (esFinal || n.includes("complet") || n.includes("final") || n.includes("cerrad")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
  }

  if (n.includes("observ") || n.includes("rechaz") || n.includes("deneg")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200",
    };
  }

  if (n.includes("pend")) {
    return {
      text: nombreEstado,
      classes:
        "text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200",
    };
  }

  return {
    text: nombreEstado,
    classes:
      "text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200",
  };
}

function badgeEstadoItemChecklist(estado) {
  const e = (estado || "pendiente").toLowerCase();
  if (e === "aprobado") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (e === "observado") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  if (e === "enviado") {
    return "bg-sky-50 text-sky-700 border border-sky-200";
  }
  if (e === "no_aplica") {
    return "bg-neutral-50 text-neutral-600 border border-neutral-200";
  }
  // pendiente
  return "bg-neutral-100 text-neutral-700 border border-neutral-200";
}

/* =================== LISTA DE SERVICIOS =================== */

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  async function cargarServicios() {
    setLoading(true);
    setError("");
    try {
      const r = await apiGET("/solicitudes/mias");
      if (r.ok) {
        setServicios(r.solicitudes || []);
      } else {
        setError(r.message || r.msg || "No se pudieron cargar tus servicios.");
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar tus servicios.");
    } finally {
      setLoading(false);
    }
  }

  if (seleccionada) {
    return (
      <DetalleSolicitud
        solicitudBase={seleccionada}
        onVolver={() => setSeleccionada(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Mis servicios contratados
          </span>

          <button
            type="button"
            onClick={cargarServicios}
            className="text-xs px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
          >
            Actualizar
          </button>
        </div>

        {loading && (
          <p className="px-4 py-4 text-sm text-neutral-500">
            Cargando tus servicios…
          </p>
        )}

        {!loading && error && (
          <p className="px-4 py-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && (!servicios || servicios.length === 0) && (
          <p className="px-4 py-4 text-sm text-neutral-500">
            Aún no tienes servicios contratados. Cuando se apruebe un pago en
            Mercado Pago, tu servicio aparecerá aquí automáticamente.
          </p>
        )}

        {!loading && !error && servicios && servicios.length > 0 && (
          <div className="divide-y">
            {servicios.map((s) => {
              const estadoBadge = badgeEstadoSolicitud(
                s.estado?.nombre,
                s.estado?.es_final
              );

              return (
                <div
                  key={s.id_solicitud}
                  className="px-4 py-3 flex justify-between items-start gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">
                        {s.titulo || "Servicio sin título"}
                      </span>

                      {s.tipo?.nombre && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {s.tipo.nombre}
                        </span>
                      )}

                      <span className={estadoBadge.classes}>
                        {estadoBadge.text}
                      </span>
                    </div>

                    {s.descripcion && (
                      <p className="text-xs text-neutral-600 mt-1">
                        {s.descripcion}
                      </p>
                    )}

                    <p className="text-xs text-neutral-500 mt-1">
                      Creada el {formatearFecha(s.fecha_creacion)}
                      {s.fecha_cierre && (
                        <>
                          {" · "}Cerrada el {formatearFecha(s.fecha_cierre)}
                        </>
                      )}
                    </p>

                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Código de seguimiento: {s.codigo_publico}
                    </p>

                    {s.origen && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Origen: {s.origen}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSeleccionada(s)}
                      className="text-xs px-3 py-1.5 rounded-md bg-[#F49E4B] text-white hover:bg-[#D88436] transition"
                    >
                      Ver solicitud
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        Nota: estas solicitudes se generan automáticamente cuando un pago de
        Mercado Pago se aprueba (por ejemplo: “Programa Máster 360°”,
        “Postulación en Andalucía”, etc.).
      </p>
    </div>
  );
}

/* =================== DETALLE DE SOLICITUD =================== */

function DetalleSolicitud({ solicitudBase, onVolver }) {
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
      // Detalle de la solicitud (estado, historial, etc.)
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

  async function handleSubirDocumento(item) {
    const url = window.prompt(
      "Pega el enlace al documento (PDF, Word, Excel, etc.).\n" +
        "Más adelante esto se puede conectar a S3/Google Cloud Storage.",
      item.url_archivo || ""
    );
    if (!url) return;

    try {
      const r = await apiPATCH(
        `/checklist/item/${item.id_solicitud_item}/documento`,
        { url_archivo: url }
      );

      if (!r.ok) {
        window.alert(
          r.message ||
            r.msg ||
            "No se pudo guardar el documento. Inténtalo nuevamente."
        );
        return;
      }

      const actualizado = r.item;
      setChecklist((prev) =>
        prev.map((it) =>
          it.id_solicitud_item === actualizado.id_solicitud_item
            ? actualizado
            : it
        )
      );
    } catch (e) {
      console.error(e);
      window.alert("Error al guardar el documento.");
    }
  }

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

        {!loading && !error && (
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
                                  {it.url_archivo ? (
                                    <a
                                      href={it.url_archivo}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-[#023A4B] underline"
                                    >
                                      Ver archivo cargado
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-neutral-400">
                                      Sin archivo cargado
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSubirDocumento(it)}
                                  className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50"
                                >
                                  Subir / cambiar documento
                                </button>
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
                    en <code>MisServicios.jsx</code>.
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
                      Universidades de destino (una por línea o separadas por comas)
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
