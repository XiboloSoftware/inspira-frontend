//inspira-frontend\src\pages\panel\components\mis-servicios\DetalleSolicitud.jsx
import { useEffect, useMemo, useState } from "react";
import { apiGET, apiPOST } from "../../../../services/api";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"; // 👈 AÑADIR ESTO

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

  // NUEVO: estado para Bloque 5
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
        // Si ya tiene datos, lo mostramos colapsado por defecto
        setFormCollapsed(tiene);
      } else {
        setFormData({});
        setFormCollapsed(false); // animar a completarlo
      }

      const rInst = await apiGET(`/solicitudes/${idSolicitud}/instructivos`);
if (rInst.ok) {
  const lista = (rInst.instructivos || []).map((i) => {
    // i.archivo_url suele venir como "/instructivos/xxxx.pdf"
    const rawUrl = i.url || i.archivo_url || "";
    const isAbsolute = /^https?:\/\//i.test(rawUrl);

    return {
      label: i.label,
      url: isAbsolute ? rawUrl : `${API_URL}${rawUrl}`, // 👈 AHORA VA AL API
    };
  });
  setInstructivos(lista);
} else {
  setInstructivos([]);
}


      // NUEVO: elecciones de másteres (bloque 5)
      const rElec = await apiGET(
        `/solicitudes/${idSolicitud}/eleccion-masters`
      );
      if (rElec.ok && Array.isArray(rElec.elecciones)) {
        if (rElec.elecciones.length > 0) {
          setElecciones(rElec.elecciones);
        } else {
          // si está vacío, creamos 5 filas base
          const base = Array.from({ length: 5 }, (_, idx) => ({
            prioridad: idx + 1,
            programa: "",
            comentario: "",
          }));
          setElecciones(base);
        }
      } else {
        const base = Array.from({ length: 5 }, (_, idx) => ({
          prioridad: idx + 1,
          programa: "",
          comentario: "",
        }));
        setElecciones(base);
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

  async function handleGuardarElecciones() {
    setSavingElecciones(true);
    try {
      const r = await apiPOST(
        `/solicitudes/${idSolicitud}/eleccion-masters`,
        {
          elecciones,
        }
      );
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

              {/* BLOQUE 5: Elección de másteres */}
              <EleccionMastersCliente
                elecciones={elecciones}
                setElecciones={setElecciones}
                onGuardar={handleGuardarElecciones}
                saving={savingElecciones}
              />

              {/* BLOQUE 6: Programación de postulaciones */}
              <ProgramacionPostulacionesCliente idSolicitud={idSolicitud} />



              {/* BLOQUE 7: Portales, claves y justificantes */}
              <PortalesYJustificantesCliente idSolicitud={idSolicitud} />



              {/* BLOQUE 8: Cierre */}

              <CierreServicioMasterCliente idSolicitud={idSolicitud} />

            </div>
          </>
        )}
      </div>
    </div>
  );
}
