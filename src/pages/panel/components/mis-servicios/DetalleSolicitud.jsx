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

  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-xs text-[#023A4B] hover:underline">
        ← Volver a mis servicios
      </button>

      {/* Sube el ancho máximo para usar mejor pantalla */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        {loading && <p>Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && detalle && (
          <>
            <EncabezadoSolicitud
              detalle={detalle}
              solicitudBase={solicitudBase}
              progresoChecklist={progresoChecklist}
            />

            {/* Grid mejorado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {/* 1) Checklist (card alto) */}
              <div className="xl:col-span-2 h-full">
                <div className="h-full flex flex-col">
                  <ChecklistDocumentos
                    checklist={checklist}
                    cargarTodo={cargarTodo}
                    idSolicitud={idSolicitud}
                  />
                </div>
              </div>

              {/* 2) Instructivos (card al lado, misma altura visual) */}
              <div className="xl:col-span-1 h-full">
                <div className="h-full flex flex-col">
                  <InstructivosPlantillas instructivos={instructivos} />
                </div>
              </div>

              {/* 3) Form (mitad) */}
              <div className="h-full">
                <div className="h-full flex flex-col">
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
              </div>

              {/* 4) Informe (mitad o 2/3 en xl, pero estira) */}
              <div className="xl:col-span-2 h-full">
                <div className="h-full flex flex-col">
                  <InformeBusqueda
                    idSolicitud={idSolicitud}
                    informe={{
                      informe_nombre_original: detalle.informe_nombre_original,
                      informe_fecha_subida: detalle.informe_fecha_subida,
                    }}
                  />
                </div>
              </div>

              {/* Full width blocks */}
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

          </>
        )}
      </div>
    </div>
  );
}
