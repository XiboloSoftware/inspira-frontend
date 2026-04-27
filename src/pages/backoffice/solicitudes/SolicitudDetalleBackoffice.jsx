// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useMemo, useState } from "react";
import FormularioDatosAcademicosAdmin from "./FormularioDatosAcademicosAdmin";
import EleccionMastersAdmin from "./EleccionMastersAdmin";
import ProgramacionPostulacionesAdmin from "./ProgramacionPostulacionesAdmin";
import PortalesYJustificantesAdmin from "./PortalesYJustificantesAdmin";
import CierreServicioMasterAdmin from "./CierreServicioMasterAdmin";
import { boPATCH } from "../../../services/backofficeApi";
import { useSolicitudDetalle } from "./hooks/useSolicitudDetalle";
import ChecklistSolicitudAdmin from "./components/ChecklistSolicitudAdmin";
import InformeAdmin from "./components/InformeAdmin";
import SeccionBackoffice from "./components/SeccionBackoffice";
import AsesoresAsignadosAdmin from "./AsesoresAsignadosAdmin";
import { AccordionBackofficeContext } from "./components/AccordionBackofficeContext";
import { formatearFecha } from "./utils";

const CAMPOS_REQUERIDOS_FORMULARIO = [
  "promedio_peru", "ubicacion_grupo", "otra_maestria_tiene",
  "experiencia_anios", "experiencia_vinculada", "ingles_situacion",
  "beca_desea", "duracion_preferida", "practicas_preferencia", "presupuesto_hasta",
];

export default function SolicitudDetalleBackoffice({ idSolicitud, onVolver }) {
  const [accordionOpenId, setAccordionOpenId] = useState(null);

  const {
    detalle, setDetalle,
    checklistPorEtapa, setChecklist,
    loading, error, cargar,
    asesoresDisponibles,
    asesoresSeleccionados, setAsesoresSeleccionados,
    guardandoAsesores, setGuardandoAsesores,
  } = useSolicitudDetalle(idSolicitud);

  async function handleGuardarAsesores() {
    if (!detalle) return;
    setGuardandoAsesores(true);
    try {
      const body = { ids_asesores: asesoresSeleccionados.map((id) => Number(id)) };
      const r = await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/asesores`, body);
      if (!r.ok) { alert(r.msg || "No se pudieron guardar los asesores"); return; }
      setDetalle((prev) => ({ ...prev, asesores: r.solicitud.asesores || [] }));
      alert("Asesores actualizados correctamente");
    } catch (e) {
      console.error(e);
      alert("Error al guardar asesores");
    } finally {
      setGuardandoAsesores(false);
    }
  }

  const checklistStats = useMemo(() => {
    const allItems = Object.values(checklistPorEtapa).flat();
    const total = allItems.length;
    if (total === 0) return { estado: "pendiente", subtitulo: "Sin checklist configurado" };
    const aprobados = allItems.filter((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    ).length;
    const hayObservados = allItems.some((it) => (it.estado_item || "").toLowerCase() === "observado");
    const estado = hayObservados ? "observado" : aprobados === total ? "completado" : "pendiente";
    return { estado, subtitulo: `${aprobados} de ${total} documentos listos` };
  }, [checklistPorEtapa]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-3 text-neutral-500">
        <div className="w-5 h-5 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Cargando solicitud…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button type="button" onClick={onVolver} className="text-xs text-primary hover:underline mb-3">← Volver</button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!detalle) return null;

  const tituloLower = String(detalle.titulo || "").toLowerCase().trim();
  const isVisado =
    Number(detalle.id_tipo_solicitud) === 15 ||
    tituloLower === "visado" ||
    tituloLower.includes("visado");

  const asesorEstado = asesoresSeleccionados.length > 0 ? "completado" : "pendiente";
  const informeEstado = detalle.informe_fecha_subida ? "completado" : "pendiente";
  const datos = detalle.datos_formulario || {};
  const tieneFormulario = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) => datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== ""
  );
  const tieneEleccion = Array.isArray(detalle.eleccion_masters) && detalle.eleccion_masters.length > 0;
  const nAsesores = asesoresSeleccionados.length;
  const nElecciones = tieneEleccion ? detalle.eleccion_masters.length : 0;

  // Layout: ocupa toda la altura del <main>, scroll solo en el interior
  return (
    <div className="flex-1 min-h-0 flex flex-col w-full px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 gap-3">

      {/* Botón volver — fijo arriba, no crece */}
      <div className="shrink-0 flex items-center gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#023A4B] text-white text-sm font-semibold hover:bg-[#035670] active:scale-95 transition-all shadow-sm group"
        >
          <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </span>
          Solicitudes
        </button>

        {/* Botón "Ver todas" — aparece cuando hay sección abierta */}
        {accordionOpenId !== null && (
          <button
            type="button"
            onClick={() => setAccordionOpenId(null)}
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 active:scale-95 transition-all group"
          >
            <svg className="w-4 h-4 text-neutral-500 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Ver todas las secciones
          </button>
        )}
      </div>

      {/* Cabecera del expediente — solo cuando no hay sección abierta */}
      {accordionOpenId === null && (
        <div className="shrink-0 bg-white border border-neutral-200 rounded-2xl shadow-sm px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
                Solicitud #{detalle.id_solicitud}
              </p>
              <h2 className="text-xl font-bold text-neutral-900 leading-snug">
                {detalle.titulo || "(Sin título)"}
              </h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                <p className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">Cliente:</span>{" "}
                  {detalle.cliente?.nombre
                    ? `${detalle.cliente.nombre}${detalle.cliente.email_contacto ? ` · ${detalle.cliente.email_contacto}` : ""}`
                    : "N/D"}
                </p>
                <p className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700">Creada:</span>{" "}
                  {formatearFecha(detalle.fecha_creacion)}
                </p>
                {detalle.fecha_cierre && (
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-700">Cerrada:</span>{" "}
                    {formatearFecha(detalle.fecha_cierre)}
                  </p>
                )}
              </div>
            </div>
            {detalle.estado && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {detalle.estado}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Secciones — flex-1 = ocupa el resto de la altura disponible */}
      <AccordionBackofficeContext.Provider value={{ openId: accordionOpenId, setOpenId: setAccordionOpenId }}>
        <div className={`flex-1 min-h-0 ${
          accordionOpenId !== null
            ? "flex flex-col pb-6"                         // sección abierta: flex + margen inferior
            : "overflow-y-auto space-y-3 pb-6 pr-0.5"     // lista: scroll interno
        }`}>

          <SeccionBackoffice
            sectionId="asesores"
            titulo="Asesores asignados"
            subtitulo={nAsesores > 0 ? `${nAsesores} asesor${nAsesores > 1 ? "es" : ""} asignado${nAsesores > 1 ? "s" : ""}` : "Sin asesores asignados"}
            estado={asesorEstado}
          >
            <AsesoresAsignadosAdmin
              asesoresDisponibles={asesoresDisponibles}
              asesoresSeleccionados={asesoresSeleccionados}
              onChangeSeleccionados={setAsesoresSeleccionados}
              onGuardar={handleGuardarAsesores}
              guardando={guardandoAsesores}
            />
          </SeccionBackoffice>

          <SeccionBackoffice
            sectionId="checklist"
            numero="1"
            titulo="Documentos requeridos"
            subtitulo={checklistStats.subtitulo}
            estado={checklistStats.estado}
          >
            <ChecklistSolicitudAdmin
              detalle={detalle}
              checklistPorEtapa={checklistPorEtapa}
              setChecklist={setChecklist}
              recargar={cargar}
            />
          </SeccionBackoffice>

          {isVisado ? (
            <>
              <SeccionBackoffice sectionId="instructivo" numero="2" titulo="Instructivo y plantillas" subtitulo="Contenido configurado por servicio en Instructivos">
                <p className="text-sm text-neutral-500">
                  Este contenido se configura por servicio en <b>Instructivos</b>.
                </p>
              </SeccionBackoffice>

              <SeccionBackoffice sectionId="portales" numero="3" titulo="Portales, claves y justificantes" subtitulo="Registra portales, claves, estado del trámite y justificantes">
                <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
              </SeccionBackoffice>
            </>
          ) : (
            <>
              <SeccionBackoffice
                sectionId="formulario"
                numero="3"
                titulo="Formulario de datos académicos"
                subtitulo={tieneFormulario ? "Formulario completado" : "El cliente aún no ha completado el formulario"}
                estado={tieneFormulario ? "completado" : "pendiente"}
              >
                <FormularioDatosAcademicosAdmin datos={detalle.datos_formulario} />
              </SeccionBackoffice>

              <SeccionBackoffice
                sectionId="informe"
                numero="4"
                titulo="Informe de búsqueda de másteres"
                subtitulo={detalle.informe_fecha_subida ? `Subido el ${formatearFecha(detalle.informe_fecha_subida)}` : "Aún no se ha subido el informe"}
                estado={informeEstado}
              >
                <InformeAdmin detalle={detalle} recargar={cargar} />
              </SeccionBackoffice>

              <SeccionBackoffice
                sectionId="eleccion"
                numero="5"
                titulo="Elección de másteres (cliente)"
                subtitulo={tieneEleccion ? `${nElecciones} máster${nElecciones > 1 ? "es" : ""} seleccionado${nElecciones > 1 ? "s" : ""}` : "El cliente aún no ha seleccionado másteres"}
                estado={tieneEleccion ? "completado" : "pendiente"}
              >
                <EleccionMastersAdmin elecciones={detalle.eleccion_masters} />
              </SeccionBackoffice>

              <SeccionBackoffice sectionId="programacion" numero="6" titulo="Programación de postulaciones" subtitulo="Gestiona las tareas por cada máster confirmado">
                <ProgramacionPostulacionesAdmin idSolicitud={detalle.id_solicitud} />
              </SeccionBackoffice>

              <SeccionBackoffice sectionId="portales" numero="7" titulo="Portales, claves y justificantes" subtitulo="Registra portales, claves, estado del trámite y justificantes">
                <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
              </SeccionBackoffice>

              <SeccionBackoffice sectionId="cierre" numero="8" titulo="Cierre de servicio de máster y siguientes pasos" subtitulo="Másteres admitidos, matriculados y cierre del expediente">
                <CierreServicioMasterAdmin idSolicitud={detalle.id_solicitud} />
              </SeccionBackoffice>
            </>
          )}
        </div>
      </AccordionBackofficeContext.Provider>
    </div>
  );
}
