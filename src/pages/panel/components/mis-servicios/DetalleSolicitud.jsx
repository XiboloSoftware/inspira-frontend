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

export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({});
  const [instructivos, setInstructivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");

  const [formCollapsed, setFormCollapsed] = useState(false);

  const [elecciones, setElecciones] = useState([]);
  const [savingElecciones, setSavingElecciones] = useState(false);

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSolicitud]);

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
        const tiene = Object.keys(rForm.datos || {}).length > 0;
        setFormCollapsed(tiene);
      } else {
        setFormData({});
        setFormCollapsed(false);
      }

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        const base = (API_URL || "").replace(/\/+$/, "");
        const lista = (rInst.instructivos || []).map((i) => {
          const rawUrl = i.url || i.archivo_url || "";
          const isAbsolute = /^https?:\/\//i.test(rawUrl);
          if (isAbsolute) return { label: i.label, url: rawUrl };
          const path = rawUrl.replace(/^\/+/, "");
          return { label: i.label, url: `${base}/${path}` };
        });
        setInstructivos(lista);
      } else {
        setInstructivos([]);
      }

      const rElec = await apiGET(`/solicitudes/${idSolicitud}/eleccion-masters`);
      const base5 = Array.from({ length: 5 }, (_, idx) => ({
        prioridad: idx + 1,
        programa: "",
        comentario: "",
      }));

      if (rElec.ok && Array.isArray(rElec.elecciones)) {
        setElecciones(rElec.elecciones.length > 0 ? rElec.elecciones : base5);
      } else {
        setElecciones(base5);
      }
    } catch (e) {
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
      if (!r.ok) {
        window.alert("No se pudo guardar.");
        return;
      }
      window.alert("Datos guardados.");
      setFormCollapsed(true);
    } catch {
      window.alert("Error al guardar.");
    } finally {
      setSavingForm(false);
    }
  }

  async function handleGuardarElecciones() {
    setSavingElecciones(true);
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/eleccion-masters`, {
        elecciones,
      });
      if (!r.ok) {
        window.alert("No se pudo guardar la elección de másteres.");
        return;
      }
      window.alert("Elección de másteres guardada.");
    } catch (e) {
      window.alert("Error al guardar elección de másteres.");
    } finally {
      setSavingElecciones(false);
    }
  }

  const hasFormData = Object.keys(formData || {}).length > 0;

  const tipoNombre = (detalle?.tipo?.nombre || "").toLowerCase().trim();
  const esVisado = tipoNombre === "visado";

  return (
    <div className="space-y-3">
      <button
        onClick={onVolver}
        className="text-xs text-[#023A4B] hover:underline font-medium"
      >
        ← Volver a mis servicios
      </button>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center text-neutral-400">
            <div className="w-4 h-4 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Cargando…</span>
          </div>
        )}
        {error && <p className="text-red-600 text-sm py-4">{error}</p>}

        {!loading && !error && detalle && (
          <>
            <EncabezadoSolicitud
              detalle={detalle}
              solicitudBase={solicitudBase}
              progresoChecklist={progresoChecklist}
            />

            {/* VISADO: 3 bloques */}
            {esVisado ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="xl:h-[480px]">
                  <ChecklistDocumentos
                    checklist={checklist}
                    cargarTodo={cargarTodo}
                    idSolicitud={idSolicitud}
                  />
                </div>
                <div className="xl:h-[480px]">
                  <InstructivosPlantillas instructivos={instructivos} />
                </div>
                <div className="col-span-full">
                  <PortalesYJustificantesCliente idSolicitud={idSolicitud} />
                </div>
              </div>
            ) : (
              /* MASTER: flujo completo */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {/* Checklist: ancho completo */}
                <div className="xl:col-span-2 xl:h-[460px]">
                  <ChecklistDocumentos
                    checklist={checklist}
                    cargarTodo={cargarTodo}
                    idSolicitud={idSolicitud}
                  />
                </div>

                {/* Instructivos */}
                <div className="xl:h-[400px]">
                  <InstructivosPlantillas instructivos={instructivos} />
                </div>

                {/* Formulario académico */}
                <div className="xl:h-[400px]">
                  <FormularioDatosAcademicos
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmitFormulario={handleSubmitFormulario}
                    savingForm={savingForm}
                    collapsed={formCollapsed}
                    onToggle={() => setFormCollapsed((v) => !v)}
                    hasData={hasFormData}
                  />
                </div>

                {/* Informe de búsqueda */}
                <div className="xl:col-span-2 xl:h-[360px]">
                  <InformeBusqueda
                    idSolicitud={idSolicitud}
                    informe={{
                      informe_nombre_original: detalle.informe_nombre_original,
                      informe_fecha_subida: detalle.informe_fecha_subida,
                    }}
                  />
                </div>

                <div className="col-span-full">
                  <EleccionMastersCliente
                    elecciones={elecciones}
                    setElecciones={setElecciones}
                    onGuardar={handleGuardarElecciones}
                    saving={savingElecciones}
                  />
                </div>

                <div className="col-span-full">
                  <ProgramacionPostulacionesCliente idSolicitud={idSolicitud} />
                </div>

                <div className="col-span-full">
                  <PortalesYJustificantesCliente idSolicitud={idSolicitud} />
                </div>

                <div className="col-span-full">
                  <CierreServicioMasterCliente idSolicitud={idSolicitud} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
