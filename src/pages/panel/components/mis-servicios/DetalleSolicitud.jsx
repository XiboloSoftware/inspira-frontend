// inspira-frontend/src/pages/panel/components/mis-servicios/DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
import { AccordionContext } from "./sections/AccordionContext";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import EncabezadoSolicitud from "./sections/EncabezadoSolicitud";
import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import InstructivosPlantillas from "./sections/InstructivosPlantillas";
import FormularioDatosAcademicos from "./sections/FormularioDatosAcademicos";
import InformeBusqueda from "./sections/InformeBusqueda";
import EleccionMastersCliente from "./sections/EleccionMastersCliente";
import ProgramacionPostulacionesCliente from "./sections/ProgramacionPostulacionesCliente";
import PortalesYJustificantesCliente from "./sections/PortalesYJustificantesCliente";
import CierreServicioMasterCliente from "./sections/CierreServicioMasterCliente";

export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({});
  const [instructivos, setInstructivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");
  const [accordionOpenId, setAccordionOpenId] = useState(null);
  const [elecciones, setElecciones] = useState([]);
  const [savingElecciones, setSavingElecciones] = useState(false);

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
  }, [idSolicitud]); // eslint-disable-line

  async function cargarTodo() {
    setLoading(true);
    setError("");
    try {
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);

      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const rForm = await apiGET(`/solicitudes/${idSolicitud}/formulario`);
      if (rForm.ok && rForm.datos) {
        setFormData(rForm.datos);
      } else {
        setFormData({});
      }

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        const base = (API_URL || "").replace(/\/+$/, "");
        setInstructivos((rInst.instructivos || []).map((i) => {
          const rawUrl = i.url || i.archivo_url || "";
          const isAbsolute = /^https?:\/\//i.test(rawUrl);
          return { label: i.label, url: isAbsolute ? rawUrl : `${base}/${rawUrl.replace(/^\/+/, "")}` };
        }));
      } else {
        setInstructivos([]);
      }

      const rElec = await apiGET(`/solicitudes/${idSolicitud}/eleccion-masters`);
      const base5 = Array.from({ length: 5 }, (_, idx) => ({ prioridad: idx + 1, programa: "", comentario: "" }));
      if (rElec.ok && Array.isArray(rElec.elecciones)) {
        setElecciones(rElec.elecciones.length > 0 ? rElec.elecciones : base5);
      } else {
        setElecciones(base5);
      }
    } catch {
      setError("Error al cargar información.");
    } finally {
      setLoading(false);
    }
  }

  const progresoChecklist = useMemo(() => {
    if (!checklist.length) return 0;
    const done = checklist.filter((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    ).length;
    return Math.round((done * 100) / checklist.length);
  }, [checklist]);

  async function handleSubmitFormulario(e) {
    e.preventDefault();
    setSavingForm(true);
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/formulario`, formData);
      if (!r.ok) { window.alert("No se pudo guardar."); return; }
      window.alert("Datos guardados.");
    } catch {
      window.alert("Error al guardar.");
    } finally {
      setSavingForm(false);
    }
  }

  async function handleGuardarElecciones() {
    setSavingElecciones(true);
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/eleccion-masters`, { elecciones });
      if (!r.ok) { window.alert("No se pudo guardar la elección de másteres."); return; }
      window.alert("Elección de másteres guardada.");
    } catch {
      window.alert("Error al guardar elección de másteres.");
    } finally {
      setSavingElecciones(false);
    }
  }

  const CAMPOS_REQUERIDOS_FORMULARIO = [
    "promedio_peru",       // 3.1 perfil cuantitativo
    "ubicacion_grupo",     // 3.1 tercio/quinto/décimo
    "otra_maestria_tiene", // 3.1 otra maestría
    "experiencia_anios",   // 3.2 años de experiencia
    "experiencia_vinculada", // 3.2 vinculación
    "ingles_situacion",    // 3.4 idiomas
    "beca_desea",          // 3.5 becas
    "duracion_preferida",  // 3.6 duración
    "practicas_preferencia", // 3.6 prácticas
    "presupuesto_hasta",   // 3.6 presupuesto
  ];
  const hasFormData = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) =>
      formData?.[campo] !== undefined &&
      formData?.[campo] !== null &&
      formData?.[campo] !== ""
  );
  const tipoNombre = (detalle?.tipo?.nombre || "").toLowerCase().trim();
  const esVisado = tipoNombre === "visado";

  return (
    // Ocupa toda la altura disponible, sin scroll externo
    <div className="flex flex-col h-full min-h-0">

      {/* Botón volver — primario, compacto, no se estira */}
      <button
        onClick={onVolver}
        className="shrink-0 self-start inline-flex items-center gap-2.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#023A4B] text-white text-sm font-semibold hover:bg-[#035670] active:scale-95 transition-all shadow-sm mb-3 group"
      >
        <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </span>
        Mis servicios
      </button>

      {/* Encabezado — se oculta cuando hay una sección abierta */}
      {accordionOpenId === null && (
        <div className="shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-5 py-4 mb-3">
          {loading && (
            <div className="flex items-center gap-2 py-2 text-neutral-400">
              <div className="w-5 h-5 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Cargando…</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-red-500">⚠</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {!loading && !error && detalle && (
            <EncabezadoSolicitud detalle={detalle} solicitudBase={solicitudBase} progresoChecklist={progresoChecklist} />
          )}
        </div>
      )}

      {/* Lista de secciones — crece y scrollea internamente */}
      {!loading && !error && detalle && (
        <AccordionContext.Provider value={{ openId: accordionOpenId, setOpenId: setAccordionOpenId }}>
          {accordionOpenId !== null && (
            {/* Botón secundario — claramente diferente del primario */}
            <button
              type="button"
              onClick={() => setAccordionOpenId(null)}
              className="shrink-0 self-start inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 active:scale-95 transition-all mb-2 group"
            >
              <svg className="w-4 h-4 text-neutral-500 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Ver todas las secciones
            </button>
          )}
          <div className={accordionOpenId !== null ? "flex-1 min-h-0 flex flex-col" : "flex-1 min-h-0 overflow-y-auto space-y-2 pb-4 pr-1"}>
            <ChecklistDocumentos checklist={checklist} cargarTodo={cargarTodo} idSolicitud={idSolicitud} />

            <InstructivosPlantillas instructivos={instructivos} />

            <FormularioDatosAcademicos
              formData={formData}
              setFormData={setFormData}
              handleSubmitFormulario={handleSubmitFormulario}
              savingForm={savingForm}
              hasData={hasFormData}
            />

            <InformeBusqueda
              idSolicitud={idSolicitud}
              informe={{
                informe_nombre_original: detalle.informe_nombre_original,
                informe_fecha_subida: detalle.informe_fecha_subida,
              }}
            />

            {!esVisado && (
              <>
                <EleccionMastersCliente
                  elecciones={elecciones}
                  setElecciones={setElecciones}
                  onGuardar={handleGuardarElecciones}
                  saving={savingElecciones}
                />
                <ProgramacionPostulacionesCliente idSolicitud={idSolicitud} />
              </>
            )}

            <PortalesYJustificantesCliente idSolicitud={idSolicitud} />

            {!esVisado && <CierreServicioMasterCliente idSolicitud={idSolicitud} />}
          </div>
        </AccordionContext.Provider>
      )}
    </div>
  );
}
