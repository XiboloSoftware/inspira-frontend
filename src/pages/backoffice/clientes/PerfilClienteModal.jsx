// src/pages/backoffice/clientes/PerfilClienteModal.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function initials(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmt(val) {
  return val || null;
}

function fmtDate(val) {
  if (!val) return null;
  try {
    return new Date(val).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return val;
  }
}

function fmtInicioPrevisto(ip) {
  if (!ip) return null;
  if (typeof ip === "object") {
    const { mes, anio } = ip;
    if (!mes || !anio) return null;
    const m = MESES[Number(mes) - 1];
    return m ? `${m} ${anio}` : `${mes}/${anio}`;
  }
  return String(ip);
}

function Section({ title, icon, children }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neutral-400">{icon}</span>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="bg-neutral-50 rounded-xl border border-neutral-100 divide-y divide-neutral-100 overflow-hidden">
        {rows}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-neutral-500 shrink-0">{label}</span>
      <span className="text-xs font-medium text-neutral-800 text-right break-all">{value}</span>
    </div>
  );
}

function EmptySection({ title, icon }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neutral-400">{icon}</span>
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="bg-neutral-50 rounded-xl border border-neutral-100 px-4 py-3">
        <p className="text-xs text-neutral-400 italic">Sin datos completados aún.</p>
      </div>
    </div>
  );
}

export default function PerfilClienteModal({ cliente, onClose }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    boGET(`/backoffice/clientes/${cliente.id_cliente}`)
      .then((r) => { if (r.ok) setPerfil(r.cliente); })
      .finally(() => setLoading(false));
  }, [cliente.id_cliente]);

  const dx = perfil?.datos_extra || {};
  const ip = fmtInicioPrevisto(dx.inicio_previsto);
  const presupuesto = dx.presupuesto_hasta
    ? `${Number(dx.presupuesto_hasta).toLocaleString("es-ES")} €`
    : null;

  const canelLabel = {
    web: "Web / Landing", referido: "Referido", redes: "Redes sociales",
    evento: "Evento / taller", otro: "Otro",
  };

  const hasPersonal = fmt(perfil?.telefono) || fmt(perfil?.pais_origen) || fmt(dx.nacionalidad) || fmt(dx.ciudad) || fmtDate(dx.fecha_nacimiento) || fmt(perfil?.canal_origen);
  const hasDocs = fmt(perfil?.dni) || fmtDate(dx.dni_emision) || fmtDate(dx.dni_vencimiento) || fmt(perfil?.pasaporte) || fmtDate(dx.pasaporte_emision) || fmtDate(dx.pasaporte_vencimiento);
  const hasAcad = fmt(dx.carrera_titulo) || fmt(dx.area_carrera) || fmt(dx.universidad_origen) || fmt(dx.inicio_estudios) || fmt(dx.fin_estudios) || fmtDate(dx.fecha_titulo) || ip || presupuesto;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl flex flex-col max-h-[92vh]">
        {/* Header con gradiente */}
        <div className="rounded-t-2xl px-5 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #1A3557 0%, #1D6A4A 100%)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 text-white text-base font-bold flex items-center justify-center shrink-0 select-none">
                {loading ? "…" : initials(perfil?.nombre || cliente.nombre)}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">
                  {perfil?.nombre || cliente.nombre || "—"}
                </h2>
                <p className="text-xs text-white/60 truncate">
                  {perfil?.email_contacto || cliente.email_contacto}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    cliente.tiene_servicio ? "bg-emerald-400/30 text-emerald-100" : "bg-white/15 text-white/60"
                  }`}>
                    {cliente.tiene_servicio ? "Con servicio" : "Sin servicio"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    cliente.activo ? "bg-emerald-400/30 text-emerald-100" : "bg-red-400/30 text-red-100"
                  }`}>
                    {cliente.activo ? "Activo" : "Inactivo"}
                  </span>
                  {!loading && perfil?.solicitudes_count > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/70">
                      {perfil.solicitudes_count} expediente{perfil.solicitudes_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white/70 hover:text-white transition-colors shrink-0"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-neutral-400">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Cargando perfil…</span>
            </div>
          )}

          {!loading && !perfil && (
            <p className="text-sm text-neutral-400 text-center py-10">No se pudo cargar el perfil del cliente.</p>
          )}

          {!loading && perfil && (
            <>
              {/* Datos personales */}
              {hasPersonal ? (
                <Section title="Datos personales" icon="👤">
                  <Row label="Teléfono" value={fmt(perfil.telefono)} />
                  <Row label="País de origen" value={fmt(perfil.pais_origen)} />
                  <Row label="Nacionalidad" value={fmt(dx.nacionalidad)} />
                  <Row label="Ciudad" value={fmt(dx.ciudad)} />
                  <Row label="Fecha de nacimiento" value={fmtDate(dx.fecha_nacimiento)} />
                  <Row label="Canal de captación" value={canelLabel[perfil.canal_origen] || fmt(perfil.canal_origen)} />
                </Section>
              ) : (
                <EmptySection title="Datos personales" icon="👤" />
              )}

              {/* Documentos */}
              {hasDocs ? (
                <Section title="Documentos de identidad" icon="🪪">
                  <Row label="DNI / Doc. nacional" value={fmt(perfil.dni)} />
                  <Row label="DNI — Emisión" value={fmtDate(dx.dni_emision)} />
                  <Row label="DNI — Vencimiento" value={fmtDate(dx.dni_vencimiento)} />
                  <Row label="Pasaporte" value={fmt(perfil.pasaporte)} />
                  <Row label="Pasaporte — Emisión" value={fmtDate(dx.pasaporte_emision)} />
                  <Row label="Pasaporte — Vencimiento" value={fmtDate(dx.pasaporte_vencimiento)} />
                </Section>
              ) : (
                <EmptySection title="Documentos de identidad" icon="🪪" />
              )}

              {/* Académico */}
              {hasAcad ? (
                <Section title="Perfil académico" icon="🎓">
                  <Row label="Carrera / Título" value={fmt(dx.carrera_titulo)} />
                  <Row label="Área" value={fmt(dx.area_carrera)} />
                  <Row label="Universidad de origen" value={fmt(dx.universidad_origen)} />
                  <Row label="Inicio estudios" value={fmt(String(dx.inicio_estudios || ""))} />
                  <Row label="Fin estudios" value={fmt(String(dx.fin_estudios || ""))} />
                  <Row label="Fecha del título" value={fmtDate(dx.fecha_titulo)} />
                  <Row label="Inicio previsto en España" value={ip} />
                  <Row label="Presupuesto máximo" value={presupuesto} />
                </Section>
              ) : (
                <EmptySection title="Perfil académico" icon="🎓" />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
