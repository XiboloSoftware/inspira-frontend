import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";

import {
  formatearFecha,
  badgeEstadoSolicitud,
  badgeEstadoItemChecklist,
} from "./utils";

import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import InstructivosPlantillas from "./sections/InstructivosPlantillas";
import EncabezadoSolicitud from "./sections/EncabezadoSolicitud";
import FormularioDatosAcademicos from "./sections/FormularioDatosAcademicos";
import InformeBusqueda from "./sections/InformeBusqueda";


export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({});
  const [instructivos, setInstructivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");

  const [formCollapsed, setFormCollapsed] = useState(false);

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
        // Si ya tiene datos, lo mostramos colapsado por defecto
        setFormCollapsed(tiene);
      } else {
        setFormData({});
        setFormCollapsed(false); // animar a completarlo
      }

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        const lista = (rInst.instructivos || []).map((i) => ({
          label: i.label,
          url: i.url || i.archivo_url,
        }));
        setInstructivos(lista);
      } else {
        setInstructivos([]);
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
      const r = await apiPOST(
        `/solicitudes/${idSolicitud}/formulario`,
        formData
      );
      if (!r.ok) {
        window.alert("No se pudo guardar.");
        return;
      }
      window.alert("Datos guardados.");
      // Después de guardar, lo colapsamos
      setFormCollapsed(true);
    } catch {
      window.alert("Error al guardar.");
    } finally {
      setSavingForm(false);
    }
  }

  const hasFormData = Object.keys(formData || {}).length > 0;

  return (
    <div className="space-y-4">
      <button
        onClick={onVolver}
        className="text-xs text-[#023A4B] hover:underline"
      >
        ← Volver a mis servicios
      </button>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <ChecklistDocumentos
                checklist={checklist}
                cargarTodo={cargarTodo}
                idSolicitud={idSolicitud}
              />

              <InstructivosPlantillas instructivos={instructivos} />

              <FormularioDatosAcademicos
                formData={formData}
                setFormData={setFormData}
                handleSubmitFormulario={handleSubmitFormulario}
                savingForm={savingForm}
                collapsed={formCollapsed}
                onToggle={() => setFormCollapsed((v) => !v)}
                hasData={hasFormData}
              />

 {/* Bloque 4: Informe */}
              <InformeBusqueda
                idSolicitud={idSolicitud}
                informe={{
                  informe_nombre_original: detalle.informe_nombre_original,
                  informe_fecha_subida: detalle.informe_fecha_subida,
                }}
              />





            </div>
          </>
        )}
      </div>
    </div>
  );
}
