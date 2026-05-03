// src/pages/backoffice/planes/PlanesAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

function IconCCAA() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498l4.875 2.437c.381.19.622.58.622 1.006v4.144a1.5 1.5 0 01-.622 1.006l-4.875 2.437a1.5 1.5 0 01-1.506 0L4.497 14.87A1.5 1.5 0 013.875 13.864V9.72a1.5 1.5 0 01.622-1.006l4.875-2.437a1.5 1.5 0 011.506 0z" />
    </svg>
  );
}

function ModalCCAAs({ plan, comunidades, onClose, onGuardado }) {
  const [draft,     setDraft]     = useState({
    ids_comunidad: new Set(plan.ccaas.map((c) => c.id_comunidad)),
    bloqueado:     plan.ccaa_bloqueado,
  });
  const [guardando, setGuardando] = useState(false);
  const [search,    setSearch]    = useState("");

  const filtradas = comunidades.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id) {
    setDraft((prev) => {
      const next = new Set(prev.ids_comunidad);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, ids_comunidad: next };
    });
  }

  async function guardar() {
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/planes/${plan.id_tipo_solicitud}`, {
        ccaa_bloqueado: draft.bloqueado,
        ids_comunidad:  Array.from(draft.ids_comunidad),
      });
      if (r.ok) onGuardado(r.plan);
    } finally { setGuardando(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-primary text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="font-bold text-sm leading-snug">{plan.nombre}</p>
            <p className="text-xs text-white/60 mt-0.5">Comunidades autónomas de este plan</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none mt-0.5">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Toggle bloqueado */}
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition">
            <div>
              <p className="text-sm font-semibold text-neutral-800">CCAAs fijas</p>
              <p className="text-xs text-neutral-500">El cliente no puede cambiarlas — solo verá las asignadas.</p>
            </div>
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, bloqueado: !d.bloqueado }))}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                draft.bloqueado ? "bg-primary" : "bg-neutral-200"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                draft.bloqueado ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </label>

          {/* Buscador */}
          <input
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Buscar comunidad…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Grid CCAAs */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
              Seleccionadas ({draft.ids_comunidad.size} de {comunidades.length})
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {filtradas.map((c) => {
                const activa = draft.ids_comunidad.has(c.id_comunidad);
                return (
                  <button
                    key={c.id_comunidad}
                    type="button"
                    onClick={() => toggle(c.id_comunidad)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${
                      activa
                        ? "bg-primary/8 border-primary text-primary"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                      activa ? "bg-primary border-primary" : "border-neutral-300"
                    }`}>
                      {activa && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{c.nombre}</span>
                  </button>
                );
              })}
            </div>
            {draft.ids_comunidad.size === 0 && (
              <p className="text-xs text-neutral-400 italic mt-2 px-1">
                Sin CCAAs → el formulario mostrará todas las comunidades disponibles.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, ids_comunidad: new Set() }))}
            className="text-xs text-neutral-400 hover:text-red-500 underline transition"
          >
            Quitar todas
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition rounded-lg border border-neutral-200 hover:bg-neutral-50">
              Cancelar
            </button>
            <button type="button" onClick={guardar} disabled={guardando}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, onClick }) {
  const numCCAAs = plan.ccaas?.length ?? 0;
  const bloqueado = plan.ccaa_bloqueado;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!plan.activo}
      className={`w-full text-left rounded-2xl border p-5 transition-all group ${
        plan.activo
          ? "border-neutral-200 hover:border-primary hover:shadow-md bg-white cursor-pointer"
          : "border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed"
      }`}
    >
      {/* Nombre + badge inactivo */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-bold text-neutral-800 text-sm leading-snug group-hover:text-primary transition-colors">
          {plan.nombre}
        </p>
        {!plan.activo && (
          <span className="shrink-0 text-[10px] bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded-full font-bold uppercase">
            Inactivo
          </span>
        )}
      </div>

      {/* CCAAs chips */}
      {numCCAAs === 0 ? (
        <p className="text-xs text-neutral-400 italic mb-3">Todas las comunidades disponibles</p>
      ) : (
        <div className="flex flex-wrap gap-1 mb-3">
          {plan.ccaas.slice(0, 6).map((c) => (
            <span key={c.id_comunidad}
              className="text-[10px] bg-primary/8 text-primary px-2 py-0.5 rounded-full font-medium">
              {c.comunidad.nombre}
            </span>
          ))}
          {numCCAAs > 6 && (
            <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-medium">
              +{numCCAAs - 6} más
            </span>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-1 text-neutral-500">
          <IconCCAA />
          <span className="text-xs font-medium">
            {numCCAAs === 0 ? "Sin restricción" : `${numCCAAs} CCAA${numCCAAs !== 1 ? "s" : ""}`}
          </span>
        </div>
        {numCCAAs > 0 && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            bloqueado
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-50 text-emerald-700"
          }`}>
            {bloqueado ? "Fijas" : "Cliente elige"}
          </span>
        )}
        <span className="text-[11px] text-primary font-semibold group-hover:underline">
          Configurar →
        </span>
      </div>
    </button>
  );
}

export default function PlanesAdmin() {
  const [planes,      setPlanes]      = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [modal,       setModal]       = useState(null); // plan seleccionado

  useEffect(() => {
    boGET("/backoffice/planes")
      .then((r) => {
        if (r.ok) {
          setPlanes(r.planes);
          setComunidades(r.comunidades);
        } else {
          setError(r.message || "Error cargando planes");
        }
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  function onGuardado(planActualizado) {
    setPlanes((prev) =>
      prev.map((p) => p.id_tipo_solicitud === planActualizado.id_tipo_solicitud ? planActualizado : p)
    );
    setModal(null);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-neutral-400">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Cargando planes…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => window.location.reload()}
          className="text-sm text-primary underline">Reintentar</button>
      </div>
    );
  }

  const activos   = planes.filter((p) => p.activo);
  const inactivos = planes.filter((p) => !p.activo);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Planes y Comunidades</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configura qué comunidades autónomas cubre cada plan y si la selección es fija.
        </p>
      </div>

      {planes.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-sm">No hay planes configurados.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activos.map((plan) => (
              <PlanCard key={plan.id_tipo_solicitud} plan={plan} onClick={() => setModal(plan)} />
            ))}
          </div>

          {inactivos.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Inactivos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactivos.map((plan) => (
                  <PlanCard key={plan.id_tipo_solicitud} plan={plan} onClick={() => {}} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <ModalCCAAs
          plan={modal}
          comunidades={comunidades}
          onClose={() => setModal(null)}
          onGuardado={onGuardado}
        />
      )}
    </div>
  );
}
