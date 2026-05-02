// src/pages/backoffice/solicitudes/SolicitudDetalleBackoffice.jsx
import { useMemo, useRef } from "react";
import FormularioDatosAcademicosAdmin from "./FormularioDatosAcademicosAdmin";
import EleccionMastersAdmin from "./EleccionMastersAdmin";
import ProgramacionPostulacionesAdmin from "./ProgramacionPostulacionesAdmin";
import PortalesYJustificantesAdmin from "./PortalesYJustificantesAdmin";
import CierreServicioMasterAdmin from "./CierreServicioMasterAdmin";
import { useSolicitudDetalle } from "./hooks/useSolicitudDetalle";
import ChecklistSolicitudAdmin from "./components/ChecklistSolicitudAdmin";
import InformeAdmin from "./components/InformeAdmin";
import EncabezadoClienteAdmin from "./EncabezadoClienteAdmin";

const RING_R = 13;
const RING_C = 2 * Math.PI * RING_R;

const CAMPOS_REQUERIDOS_FORMULARIO = [
  "promedio_peru", "ubicacion_grupo", "otra_maestria_tiene",
  "experiencia_anios", "experiencia_vinculada", "ingles_situacion",
  "beca_desea", "duracion_preferida", "practicas_preferencia", "presupuesto_hasta",
];

function BlqHead({ numero, titulo, estado }) {
  const badge = {
    completado: "bg-[#1D6A4A] text-white",
    observado:  "bg-[#DC2626] text-white",
    pendiente:  "bg-[#FFFBEA] text-[#F59E0B] border-2 border-[#F59E0B]/30",
    inactivo:   "bg-[#F4F6F9] text-[#6B7280] border-2 border-[#E2E8F0]",
  };
  const chip = {
    completado: "bg-[#E8F5EE] text-[#1D6A4A]",
    observado:  "bg-[#FEF2F2] text-[#DC2626]",
    pendiente:  "bg-[#FFFBEA] text-[#F59E0B]",
    inactivo:   "bg-[#F4F6F9] text-[#6B7280]",
  };
  const chipLabel = {
    completado: "✓ Completo",
    observado:  "⚠ Observado",
    pendiente:  "● En progreso",
    inactivo:   "— Inactivo",
  };
  const e = estado || "inactivo";
  return (
    <div className="flex items-center gap-2.5 mb-[13px] flex-wrap">
      <div className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[13px] font-extrabold font-mono shrink-0 ${badge[e] || badge.inactivo}`}>
        {numero}
      </div>
      <h3 className="font-serif text-[16px] text-[#1A3557] flex-1">{titulo}</h3>
      <span className={`text-[10.5px] font-semibold px-[11px] py-1 rounded-full ${chip[e] || chip.inactivo}`}>
        {chipLabel[e] || "—"}
      </span>
    </div>
  );
}

function CBox({ children }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,.06)]">
      {children}
    </div>
  );
}

export default function SolicitudDetalleBackoffice({ idSolicitud, onVolver }) {
  const mainRef = useRef(null);

  const {
    detalle, setDetalle,
    checklistPorEtapa, setChecklist,
    loading, error, cargar,
  } = useSolicitudDetalle(idSolicitud);

  function irABloque(id) {
    const el = document.getElementById(`bloque-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const checklistStats = useMemo(() => {
    const allItems = Object.values(checklistPorEtapa).flat();
    const total = allItems.length;
    if (total === 0) return { estado: "pendiente" };
    const aprobados = allItems.filter((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    ).length;
    const hayObservados = allItems.some((it) => (it.estado_item || "").toLowerCase() === "observado");
    return { estado: hayObservados ? "observado" : aprobados === total ? "completado" : "pendiente" };
  }, [checklistPorEtapa]);

  const { bloques, isVisado } = useMemo(() => {
    if (!detalle) return { bloques: [], isVisado: false };
    const tituloLower = String(detalle.titulo || "").toLowerCase().trim();
    const visado =
      Number(detalle.id_tipo_solicitud) === 15 ||
      tituloLower === "visado" ||
      tituloLower.includes("visado");

    const datos = detalle.datos_formulario || {};
    const tieneForm = CAMPOS_REQUERIDOS_FORMULARIO.every(
      (c) => datos[c] !== undefined && datos[c] !== null && datos[c] !== ""
    );
    const hayEleccion = Array.isArray(detalle.eleccion_masters) && detalle.eleccion_masters.length > 0;
    const clienteOk = !!(detalle.cliente?.nombre);

    const lista = visado
      ? [
          { id: "cliente",     numero: "1", label: "Encabezado cliente",  estado: clienteOk ? "completado" : "pendiente" },
          { id: "checklist",   numero: "2", label: "Documentos",          estado: checklistStats.estado },
          { id: "instructivo", numero: "3", label: "Instructivo",         estado: "inactivo" },
          { id: "portales",    numero: "4", label: "Portales · Claves",   estado: "pendiente" },
        ]
      : [
          { id: "cliente",      numero: "1", label: "Encabezado cliente",      estado: clienteOk ? "completado" : "pendiente" },
          { id: "checklist",    numero: "2", label: "Documentos",              estado: checklistStats.estado },
          { id: "formulario",   numero: "3", label: "Formulario académico",    estado: tieneForm ? "completado" : "pendiente" },
          { id: "informe",      numero: "4", label: "Informe IA másteres",     estado: detalle.informe_fecha_subida ? "completado" : "pendiente" },
          { id: "eleccion",     numero: "5", label: "Elección del cliente",    estado: hayEleccion ? "completado" : "pendiente" },
          { id: "programacion", numero: "6", label: "Postulaciones · Portales", estado: "pendiente" },
          { id: "portales",     numero: "7", label: "Portales y justificantes", estado: "pendiente" },
          { id: "cierre",       numero: "8", label: "Cierre y derivación",     estado: "pendiente" },
        ];
    return { bloques: lista, isVisado: visado };
  }, [detalle, checklistStats]);

  function handleEleccionesActualizadas(nuevasElecciones) {
    setDetalle((prev) => ({ ...prev, eleccion_masters: nuevasElecciones }));
  }

  const pct = useMemo(() => {
    if (!bloques.length) return 0;
    const done = bloques.filter((b) => b.estado === "completado").length;
    return Math.round((done / bloques.length) * 100);
  }, [bloques]);

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
        <button type="button" onClick={onVolver} className="text-xs text-[#1D6A4A] hover:underline mb-3">← Volver</button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!detalle) return null;

  const datos = detalle.datos_formulario || {};
  const tieneFormulario = CAMPOS_REQUERIDOS_FORMULARIO.every(
    (campo) => datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== ""
  );
  const tieneEleccion = Array.isArray(detalle.eleccion_masters) && detalle.eleccion_masters.length > 0;

  function dotColor(estado) {
    if (estado === "completado") return "bg-[#1D6A4A]";
    if (estado === "observado")  return "bg-[#DC2626]";
    if (estado === "pendiente")  return "bg-[#F59E0B]";
    return "bg-[#E2E8F0]";
  }

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] flex-none border-r border-[#E2E8F0] bg-white overflow-y-auto px-[9px] py-3">

        {/* Back button */}
        <button
          type="button"
          onClick={onVolver}
          className="flex items-center gap-2 px-2 py-2 mb-2 rounded-[8px] text-[12px] font-semibold text-[#6B7280] hover:bg-[#F4F6F9] hover:text-[#1A1A2E] transition-all group w-full"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Solicitudes
        </button>

        {/* Case info box */}
        <div className="bg-[#EEF2F8] border border-[#1A3557]/[.12] rounded-[11px] p-[11px] mb-[9px]">
          <p className="font-mono text-[9px] tracking-[.2em] text-[#6B7280] uppercase mb-[3px]">
            Solicitud #{detalle.id_solicitud}
          </p>
          <p className="font-serif text-[12.5px] text-[#1A3557] leading-[1.3] mb-1">
            {detalle.titulo || "(Sin título)"}
          </p>
          <p className="text-[11px] text-[#6B7280]">{detalle.cliente?.nombre || "Sin nombre"}</p>
        </div>

        {/* Progress ring */}
        <div className="bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-[9px] px-[11px] py-[9px] mb-[9px] flex items-center gap-2.5">
          <div className="relative w-[34px] h-[34px] shrink-0">
            <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: "rotate(-90deg)" }}>
              <circle fill="none" stroke="rgba(29,106,74,.15)" cx="17" cy="17" r={RING_R} strokeWidth="3" />
              <circle
                fill="none"
                stroke="#1D6A4A"
                cx="17" cy="17" r={RING_R}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - pct / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-[#1D6A4A]">
              {pct}%
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1D6A4A]">Progreso</p>
            <p className="text-[11px] text-[#6B7280]">en curso</p>
          </div>
        </div>

        {/* Nav title */}
        <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[.15em] px-2 pt-[7px] pb-[3px]">
          Bloques del expediente
        </p>

        {/* Nav links */}
        {bloques.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => irABloque(b.id)}
            className={`flex items-center gap-2 px-2 py-2 rounded-[8px] transition-all cursor-pointer w-full mb-[2px] border border-transparent text-left ${
              b.estado === "completado" ? "text-[#155a3d]" : "text-[#6B7280]"
            } hover:bg-[#F4F6F9] hover:text-[#1A1A2E]`}
          >
            <span className={`w-[21px] h-[21px] rounded-[6px] flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
              b.estado === "completado" ? "bg-[#E8F5EE] text-[#1D6A4A]" : "bg-[#F4F6F9] text-[#6B7280]"
            }`}>
              {b.numero}
            </span>
            <span className="text-[11.5px] font-medium flex-1 leading-[1.3]">{b.label}</span>
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${dotColor(b.estado)}`} />
          </button>
        ))}
      </aside>

      {/* ── MAIN SCROLL ── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-[#F4F6F9]">
        <div className="p-[22px] pb-20">

          {/* B1 — Encabezado del cliente */}
          <div id="bloque-cliente" className="mb-8 scroll-mt-4">
            <BlqHead numero="1" titulo="Encabezado del cliente" estado={detalle.cliente?.nombre ? "completado" : "pendiente"} />
            <CBox>
              <EncabezadoClienteAdmin detalle={detalle} />
            </CBox>
          </div>

          {/* B2 — Documentos requeridos */}
          <div id="bloque-checklist" className="mb-8 scroll-mt-4">
            <BlqHead numero="2" titulo="Documentos requeridos" estado={checklistStats.estado} />
            <CBox>
              <div className="p-5">
                <ChecklistSolicitudAdmin
                  detalle={detalle}
                  checklistPorEtapa={checklistPorEtapa}
                  setChecklist={setChecklist}
                  recargar={cargar}
                />
              </div>
            </CBox>
          </div>

          {isVisado ? (
            <>
              <div id="bloque-instructivo" className="mb-8 scroll-mt-4">
                <BlqHead numero="3" titulo="Instructivo y plantillas" estado="inactivo" />
                <CBox>
                  <div className="px-5 py-4">
                    <p className="text-sm text-neutral-500">
                      Este contenido se configura por servicio en <b>Instructivos</b>.
                    </p>
                  </div>
                </CBox>
              </div>

              <div id="bloque-portales" className="mb-8 scroll-mt-4">
                <BlqHead numero="4" titulo="Portales, claves y justificantes" estado="pendiente" />
                <CBox>
                  <div className="p-5">
                    <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
                  </div>
                </CBox>
              </div>
            </>
          ) : (
            <>
              {/* B3 — Formulario académico */}
              <div id="bloque-formulario" className="mb-8 scroll-mt-4">
                <BlqHead
                  numero="3"
                  titulo="Formulario de datos académicos"
                  estado={tieneFormulario ? "completado" : "pendiente"}
                />
                <CBox>
                  <div className="p-5">
                    <FormularioDatosAcademicosAdmin datos={detalle.datos_formulario} />
                  </div>
                </CBox>
              </div>

              {/* B4 — Informe de búsqueda */}
              <div id="bloque-informe" className="mb-8 scroll-mt-4">
                <BlqHead
                  numero="4"
                  titulo="Informe de búsqueda de másteres"
                  estado={detalle.informe_fecha_subida ? "completado" : "pendiente"}
                />
                <CBox>
                  <div className="px-5 pt-4">
                    <InformeAdmin detalle={detalle} recargar={cargar} />
                  </div>
                </CBox>
              </div>

              {/* B5 — Elección de másteres */}
              <div id="bloque-eleccion" className="mb-8 scroll-mt-4">
                <BlqHead
                  numero="5"
                  titulo="Elección de másteres (cliente)"
                  estado={tieneEleccion ? "completado" : "pendiente"}
                />
                <CBox>
                  <div className="p-5">
                    <EleccionMastersAdmin
                      elecciones={detalle.eleccion_masters}
                      idSolicitud={detalle.id_solicitud}
                      onEleccionesActualizadas={handleEleccionesActualizadas}
                    />
                  </div>
                </CBox>
              </div>

              {/* B6 — Programación de postulaciones */}
              <div id="bloque-programacion" className="mb-8 scroll-mt-4">
                <BlqHead numero="6" titulo="Programación de postulaciones" estado="pendiente" />
                <CBox>
                  <div className="p-5">
                    <ProgramacionPostulacionesAdmin idSolicitud={detalle.id_solicitud} />
                  </div>
                </CBox>
              </div>

              {/* B7 — Portales y justificantes */}
              <div id="bloque-portales" className="mb-8 scroll-mt-4">
                <BlqHead numero="7" titulo="Portales, claves y justificantes" estado="pendiente" />
                <CBox>
                  <div className="p-5">
                    <PortalesYJustificantesAdmin idSolicitud={detalle.id_solicitud} />
                  </div>
                </CBox>
              </div>

              {/* B8 — Cierre de servicio */}
              <div id="bloque-cierre" className="mb-8 scroll-mt-4">
                <BlqHead numero="8" titulo="Cierre de servicio y derivación" estado="pendiente" />
                <CBox>
                  <div className="px-5 pt-4">
                    <CierreServicioMasterAdmin idSolicitud={detalle.id_solicitud} />
                  </div>
                </CBox>
              </div>
            </>
          )}

        </div>
      </main>

    </div>
  );
}
