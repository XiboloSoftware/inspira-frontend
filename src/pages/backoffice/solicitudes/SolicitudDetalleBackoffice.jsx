// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import FormularioDatosAcademicosAdmin from "./FormularioDatosAcademicosAdmin";
import EleccionMastersAdmin from "./EleccionMastersAdmin";
import ProgramacionPostulacionesAdmin from "./ProgramacionPostulacionesAdmin";
import PortalesYJustificantesAdmin from "./PortalesYJustificantesAdmin";
import CierreServicioMasterAdmin from "./CierreServicioMasterAdmin";

import { boPATCH } from "../../../services/backofficeApi";
import { useSolicitudDetalle } from "./hooks/useSolicitudDetalle";

import SolicitudHeader from "./components/SolicitudHeader";
import ChecklistSolicitudAdmin from "./components/ChecklistSolicitudAdmin";
import InformeAdmin from "./components/InformeAdmin";

export default function SolicitudDetalleBackoffice({ idSolicitud, onVolver }) {
  const {
    detalle,
    setDetalle,
    checklistPorEtapa,
    setChecklist,
    loading,
    error,
    cargar,

    asesoresDisponibles,
    asesoresSeleccionados,
    setAsesoresSeleccionados,
    guardandoAsesores,
    setGuardandoAsesores,
  } = useSolicitudDetalle(idSolicitud);

  async function handleGuardarAsesores() {
    if (!detalle) return;
    setGuardandoAsesores(true);
    try {
      const body = { ids_asesores: asesoresSeleccionados.map((id) => Number(id)) };

      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/asesores`, body);
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

  // ✅ VISADO = id_tipo_solicitud 15
  const isVisado =
    Number(detalle.id_tipo_solicitud) === 15 ||
    String(detalle.tipo_solicitud || detalle.tipo_nombre || "")
      .toLowerCase()
      .includes("visado");

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        <SolicitudHeader
          detalle={detalle}
          onVolver={onVolver}
          asesoresDisponibles={asesoresDisponibles}
          asesoresSeleccionados={asesoresSeleccionados}
          onChangeSeleccionados={setAsesoresSeleccionados}
          onGuardarAsesores={handleGuardarAsesores}
          guardandoAsesores={guardandoAsesores}
        />

        {/* 1) Documentos requeridos (Checklist) */}
        <ChecklistSolicitudAdmin
          detalle={detalle}
          checklistPorEtapa={checklistPorEtapa}
          setChecklist={setChecklist}
          recargar={cargar}
        />

        {/* ✅ VISADO: solo módulos que aplican */}
        {isVisado ? (
          <>
            {/* 2) Instructivos y plantillas:
               En tu backoffice los instructivos se gestionan por SERVICIO (pantalla aparte),
               no por solicitud. Si quieres, aquí puedes poner un bloque informativo/enlace. */}
            <section className="border border-neutral-200 rounded-lg p-3 mb-4 mt-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                2. Instructivo y plantillas
              </h3>
              <p className="text-xs text-neutral-500">
                Se configuran por servicio en el módulo “Instructivos”.
              </p>
            </section>

            {/* 3) Portales, claves y justificantes */}
            <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
          </>
        ) : (
          <>
            {/* ====== FLUJO MÁSTER (7 bloques) ====== */}

            {/* 3. Formulario */}
            <section className="border border-neutral-200 rounded-lg p-3 mb-4 mt-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                3. Formulario de datos académicos
              </h3>
              <FormularioDatosAcademicosAdmin datos={detalle.datos_formulario} />
            </section>

            {/* 4. Informe */}
            <InformeAdmin detalle={detalle} recargar={cargar} />

            {/* 5. Elección */}
            <section className="border border-neutral-200 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
                5. Elección de másteres (cliente)
              </h3>
              <p className="text-xs text-neutral-500 mb-2">
                Másteres que el cliente ha seleccionado y ordenado por prioridad después de revisar el informe.
              </p>
              <EleccionMastersAdmin elecciones={detalle.eleccion_masters} />
            </section>

            {/* 6. Programación */}
            <ProgramacionPostulacionesAdmin idSolicitud={detalle.id_solicitud} />

            {/* 7. Portales */}
            <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />

            {/* 8. Cierre */}
            <CierreServicioMasterAdmin idSolicitud={detalle.id_solicitud} />
          </>
        )}
      </div>
    </div>
  );
}
