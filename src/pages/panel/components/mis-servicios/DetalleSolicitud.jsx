// inspira-frontend/src/pages/panel/components/mis-servicios/DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
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

const CAMPOS_REQUERIDOS_FORMULARIO = [
  "promedio_peru",
  "ubicacion_grupo",
  "otra_maestria_tiene",
  "experiencia_anios",
  "experiencia_vinculada",
  "ingles_situacion",
  "beca_desea",
  "duracion_preferida",
  "practicas_preferencia",
  "presupuesto_hasta",
];

function formCompleto(datos) {
  return CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) => datos?.[campo] != null && datos?.[campo] !== ""
  );
}

export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({});
  const [instructivos, setInstructivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");
  const [elecciones, setElecciones] = useState([]);
  const [savingElecciones, setSavingElecciones] = useState(false);

  // Compatibilidad: levantada aquí para compartir entre InformeBusqueda y EleccionMasters
  const [compat, setCompat] = useState(null);
  const [loadingCompat, setLoadingCompat] = useState(false);
  // formGuardado: true solo cuando el servidor tiene datos completos (carga inicial o tras guardar)
  const [formGuardado, setFormGuardado] = useState(false);
  // se incrementa cada vez que el usuario guarda el formulario → EleccionMasters limpia su selección
  const [seleccionKey, setSeleccionKey] = useState(0);
  // se incrementa cada vez que el usuario guarda su elección → Postulaciones re-fetcha del backend
  const [postulacionesKey, setPostulacionesKey] = useState(0);

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
  }, [idSolicitud]); // eslint-disable-line

  async function cargarCompatibilidad() {
    setLoadingCompat(true);
    setCompat(null);
    try {
      const r = await apiGET(`/solicitudes/${idSolicitud}/compatibilidad`);
      if (r.ok) setCompat(r);
    } catch { /* silencioso */ }
    finally { setLoadingCompat(false); }
  }

  async function cargarTodo() {
    setLoading(true);
    setError("");
    setCompat(null);
    setFormGuardado(false);
    try {
      const rDetalle = await apiGET(`/solicitudes/${idSolicitud}`);
      if (rDetalle.ok) setDetalle(rDetalle.solicitud);

      const rChecklist = await apiGET(`/checklist/${idSolicitud}`);
      if (rChecklist.ok) setChecklist(rChecklist.checklist || []);

      const [rForm, rPerfil] = await Promise.all([
        apiGET(`/solicitudes/${idSolicitud}/formulario`),
        apiGET("/cliente/me"),
      ]);
      const datosPerfil = rPerfil.ok ? (rPerfil.cliente?.datos_extra || {}) : {};
      const datosForm   = (rForm.ok && rForm.datos) ? rForm.datos : {};
      const merged = {
        carrera_titulo:     datosForm.carrera_titulo     || datosPerfil.carrera_titulo     || "",
        area_carrera:       datosForm.area_carrera       || datosPerfil.area_carrera       || "",
        universidad_origen: datosForm.universidad_origen || datosPerfil.universidad_origen || "",
        ...datosForm,
      };
      setFormData(merged);

      // Si el formulario ya estaba completo en el servidor, arrancar fetch de compatibilidad
      if (formCompleto(merged)) {
        setFormGuardado(true);
        cargarCompatibilidad(); // fire & forget
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
      // Limpiar elecciones y postulaciones en backend (nuevo informe = selección desde cero)
      const base5 = Array.from({ length: 5 }, (_, idx) => ({ prioridad: idx + 1, programa: "", comentario: "" }));
      Promise.all([
        apiPOST(`/solicitudes/${idSolicitud}/eleccion-masters`, { elecciones: [] }).catch(() => {}),
        apiPOST(`/solicitudes/${idSolicitud}/postulaciones`, { postulaciones: [] }).catch(() => {}),
      ]);
      setElecciones(base5);
      setFormGuardado(true);
      setSeleccionKey((k) => k + 1);
      cargarCompatibilidad();
    } catch {
      window.alert("Error al guardar.");
    } finally {
      setSavingForm(false);
    }
  }

  async function guardarFormularioSilencioso() {
    try {
      await apiPOST(`/solicitudes/${idSolicitud}/formulario`, formData);
    } catch { /* silencioso */ }
  }

  async function handleGuardarElecciones(data) {
    setSavingElecciones(true);
    try {
      const payload = data ?? elecciones;
      const r = await apiPOST(`/solicitudes/${idSolicitud}/eleccion-masters`, { elecciones: payload });
      if (!r.ok) { window.alert("No se pudo guardar la elección de másteres."); return; }
      window.alert("Elección de másteres guardada.");
      setPostulacionesKey((k) => k + 1);
    } catch {
      window.alert("Error al guardar elección de másteres.");
    } finally {
      setSavingElecciones(false);
    }
  }

  // hasFormData: reactivo al input del usuario (para el indicador de progreso del formulario)
  const hasFormData = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) =>
      formData?.[campo] !== undefined &&
      formData?.[campo] !== null &&
      formData?.[campo] !== ""
  );
  const tipoNombre = (detalle?.tipo?.nombre || "").toLowerCase().trim();
  const esVisado = tipoNombre === "visado";

  const planCCAAs = useMemo(() => {
    if (!detalle) return null;
    const ccaas = Array.isArray(detalle.tipo?.ccaas) ? detalle.tipo.ccaas : [];
    if (ccaas.length === 0) return null;
    return {
      bloqueado: detalle.tipo?.ccaa_bloqueado ?? false,
      opciones:  ccaas.map((c) => c.comunidad.nombre),
    };
  }, [detalle]);

  return (
    <div className="flex flex-col h-full min-h-0">

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

      {!loading && !error && detalle && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-4 pr-1">
            <ChecklistDocumentos checklist={checklist} cargarTodo={cargarTodo} idSolicitud={idSolicitud} />

            <InstructivosPlantillas instructivos={instructivos} />

            <FormularioDatosAcademicos
              formData={formData}
              setFormData={setFormData}
              handleSubmitFormulario={handleSubmitFormulario}
              onGuardarProgreso={guardarFormularioSilencioso}
              savingForm={savingForm}
              hasData={hasFormData}
              planCCAAs={planCCAAs}
            />

            <InformeBusqueda
              idSolicitud={idSolicitud}
              informe={{
                informe_nombre_original: detalle.informe_nombre_original,
                informe_fecha_subida: detalle.informe_fecha_subida,
              }}
              hasFormData={formGuardado}
              compat={compat}
              loadingCompat={loadingCompat}
            />

            {!esVisado && (
              <>
                <EleccionMastersCliente
                  elecciones={elecciones}
                  onGuardar={handleGuardarElecciones}
                  saving={savingElecciones}
                  idSolicitud={idSolicitud}
                  hasFormData={formGuardado}
                  compat={compat}
                  loadingCompat={loadingCompat}
                  resetKey={seleccionKey}
                />
                <ProgramacionPostulacionesCliente idSolicitud={idSolicitud} resetKey={seleccionKey} reloadKey={postulacionesKey} />
              </>
            )}

            <PortalesYJustificantesCliente idSolicitud={idSolicitud} />

            {!esVisado && <CierreServicioMasterCliente idSolicitud={idSolicitud} />}
        </div>
      )}
    </div>
  );
}
