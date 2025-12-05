// src/pages/panel/components/mis-servicios/DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";

// Ya no lo necesitamos si todo viene desde el backend
// import { INSTRUCTIVOS_POR_TIPO } from "./constants";
import {
  formatearFecha,
  badgeEstadoSolicitud,
  badgeEstadoItemChecklist,
} from "./utils";

import ChecklistDocumentos from "./sections/ChecklistDocumentos";
import InstructivosPlantillas from "./sections/InstructivosPlantillas";
import EncabezadoSolicitud from "./sections/EncabezadoSolicitud";
import FormularioDatosAcademicos from "./sections/FormularioDatosAcademicos";

export default function DetalleSolicitud({ solicitudBase, onVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [formData, setFormData] = useState({});
  const [instructivos, setInstructivos] = useState([]); // NUEVO
  const [loading, setLoading] = useState(true);
  const [savingForm, setSavingForm] = useState(false);
  const [error, setError] = useState("");

  const idSolicitud = solicitudBase.id_solicitud;

  useEffect(() => {
    cargarTodo();
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
      }

      // NUEVO: obtener instructivos reales desde backend
      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
      if (rInst.ok) {
        // Adaptamos a lo que espera <InstructivosPlantillas />: [{ label, url }]
        const lista = (rInst.instructivos || []).map((i) => ({
          label: i.label,
          // Si tu backend devuelve 'archivo_url' como URL completa, esto basta.
          // Si es una ruta relativa, aquí armas la URL final.
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
      if (!r.ok) return window.alert("No se pudo guardar.");
      window.alert("Datos guardados.");
    } catch {
      window.alert("Error al guardar.");
    } finally {
      setSavingForm(false);
    }
  }

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChecklistDocumentos
                checklist={checklist}
                cargarTodo={cargarTodo}
                idSolicitud={idSolicitud}
              />

              {/* Ahora viene de la API */}
              <InstructivosPlantillas instructivos={instructivos} />

              <FormularioDatosAcademicos
                formData={formData}
                setFormData={setFormData}
                handleSubmitFormulario={handleSubmitFormulario}
                savingForm={savingForm}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
