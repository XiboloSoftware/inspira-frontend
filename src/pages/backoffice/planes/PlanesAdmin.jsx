// src/pages/backoffice/planes/PlanesAdmin.jsx
// Gestión de planes de servicio: asignación de CCAAs y flag bloqueado
import { useEffect, useState } from "react";
import { boGET, boPATCH } from "../../../services/backofficeApi";

export default function PlanesAdmin() {
  const [planes, setPlanes]             = useState([]);
  const [comunidades, setComunidades]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editando, setEditando]         = useState(null); // id_tipo_solicitud
  const [guardando, setGuardando]       = useState(false);
  const [draft, setDraft]               = useState(null); // { ids_comunidad: Set<number>, bloqueado: bool }

  useEffect(() => {
    boGET("/backoffice/planes")
      .then((r) => {
        if (r.ok) {
          setPlanes(r.planes);
          setComunidades(r.comunidades);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function abrirEditor(plan) {
    setEditando(plan.id_tipo_solicitud);
    setDraft({
      ids_comunidad: new Set(plan.ccaas.map((c) => c.id_comunidad)),
      bloqueado:     plan.ccaa_bloqueado,
    });
  }

  function cerrarEditor() {
    setEditando(null);
    setDraft(null);
  }

  function toggleCCAA(id) {
    setDraft((prev) => {
      const next = new Set(prev.ids_comunidad);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, ids_comunidad: next };
    });
  }

  async function guardar() {
    if (!editando || !draft) return;
    setGuardando(true);
    try {
      const r = await boPATCH(`/backoffice/planes/${editando}`, {
        ccaa_bloqueado: draft.bloqueado,
        ids_comunidad:  Array.from(draft.ids_comunidad),
      });
      if (r.ok) {
        setPlanes((prev) =>
          prev.map((p) => p.id_tipo_solicitud === editando ? r.plan : p)
        );
        cerrarEditor();
      }
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-neutral-400">
        <div className="w-5 h-5 border-2 border-[#1A3557] border-t-transparent rounded-full animate-spin" />
        Cargando planes…
      </div>
    );
  }

  const planEditando = planes.find((p) => p.id_tipo_solicitud === editando);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A3557]">Planes y Comunidades</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configura qué comunidades autónomas cubre cada plan y si la selección es fija.
        </p>
      </div>

      {/* Modal editor */}
      {editando && draft && planEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#1A3557] text-white px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-sm">{planEditando.nombre}</p>
                <p className="text-xs text-white/60 mt-0.5">Configura las comunidades de este plan</p>
              </div>
              <button type="button" onClick={cerrarEditor} className="text-white/60 hover:text-white text-lg leading-none mt-0.5">✕</button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Toggle bloqueado */}
              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">CCAAs fijas (bloqueado)</p>
                  <p className="text-xs text-neutral-500">El cliente no puede elegir — solo verá las comunidades asignadas al plan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, bloqueado: !d.bloqueado }))}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    draft.bloqueado ? "bg-[#1D6A4A]" : "bg-neutral-200"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    draft.bloqueado ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </label>

              {/* Lista CCAAs */}
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
                  Comunidades incluidas ({draft.ids_comunidad.size})
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {comunidades.map((c) => {
                    const activa = draft.ids_comunidad.has(c.id_comunidad);
                    return (
                      <button
                        key={c.id_comunidad}
                        type="button"
                        onClick={() => toggleCCAA(c.id_comunidad)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${
                          activa
                            ? "bg-[#1A3557]/8 border-[#1A3557] text-[#1A3557]"
                            : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                          activa ? "bg-[#1A3557] border-[#1A3557]" : "border-neutral-300"
                        }`}>
                          {activa && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        {c.nombre}
                      </button>
                    );
                  })}
                </div>
                {draft.ids_comunidad.size === 0 && (
                  <p className="text-xs text-neutral-400 italic mt-2">
                    Sin CCAAs asignadas → el formulario mostrará todas las comunidades disponibles.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, ids_comunidad: new Set() }))}
                className="text-xs text-neutral-400 hover:text-red-500 underline transition"
              >
                Quitar todas
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cerrarEditor}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardar}
                  disabled={guardando}
                  className="px-5 py-2 rounded-lg bg-[#1A3557] text-white text-sm font-semibold hover:bg-[#142a45] disabled:opacity-50 transition"
                >
                  {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de planes */}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">CCAAs asignadas</th>
              <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide text-center">Bloqueado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {planes.map((plan) => (
              <tr key={plan.id_tipo_solicitud} className={`transition-colors ${!plan.activo ? "opacity-40" : "hover:bg-neutral-50/60"}`}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-800 text-[13px] leading-snug">{plan.nombre}</p>
                  {!plan.activo && <span className="text-[10px] text-neutral-400 font-mono">INACTIVO</span>}
                </td>
                <td className="px-4 py-3">
                  {plan.ccaas.length === 0 ? (
                    <span className="text-xs text-neutral-400 italic">Sin restricción — muestra todas</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {plan.ccaas.map((c) => (
                        <span key={c.id_comunidad} className="text-[10px] bg-[#1A3557]/8 text-[#1A3557] px-2 py-0.5 rounded-full font-medium">
                          {c.comunidad.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {plan.ccaas.length > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      plan.ccaa_bloqueado
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {plan.ccaa_bloqueado ? "Fijo" : "Elige"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => abrirEditor(plan)}
                    className="text-xs font-semibold text-[#1A3557] hover:text-[#1D6A4A] underline transition"
                  >
                    Configurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
