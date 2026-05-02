// src/pages/backoffice/solicitudes/CierreServicioMasterAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPATCH } from "../../../services/backofficeApi";

const DECISIONES = ["ACEPTA_COMO_PRINCIPAL", "EN_ESPERA", "RECHAZA"];

function labelDecision(decision) {
  if (!decision) return "Sin decidir";
  switch (decision) {
    case "ACEPTA_COMO_PRINCIPAL": return "Acepta como principal";
    case "EN_ESPERA":             return "En espera";
    case "RECHAZA":               return "Rechaza";
    default:                      return decision;
  }
}

const RESUMEN_VACIO = { inversion_total: "", plan_contratado: "", matricula_minima: "" };

export default function CierreServicioMasterAdmin({ idSolicitud }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(RESUMEN_VACIO);
  const [guardandoResumen, setGuardandoResumen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [r, rd] = await Promise.all([
          boGET(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8`),
          boGET(`/backoffice/solicitudes/${idSolicitud}`),
        ]);
        if (!cancelled) {
          if (r.ok && r.masters) setMasters(r.masters);
          const rf = rd?.datos_panel?.resumen_financiero;
          if (rf) setResumen({ inversion_total: rf.inversion_total ?? "", plan_contratado: rf.plan_contratado ?? "", matricula_minima: rf.matricula_minima ?? "" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  async function guardarResumen() {
    setGuardandoResumen(true);
    try {
      await boPATCH(`/backoffice/solicitudes/${idSolicitud}/datos-panel`, {
        resumen_financiero: resumen,
      });
    } finally {
      setGuardandoResumen(false);
    }
  }

  const handleChange = (idx, field, value) => {
    setMasters((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  };

  const handleSave = async (idx) => {
    const row = masters[idx];
    const r = await boPOST(
      `/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/decisiones`,
      {
        id_acceso_portal: row.id_acceso_portal,
        decision_cliente: row.decision_cliente,
        es_master_final: row.es_master_final,
        info_pagos: row.info_pagos,
      }
    );
    if (!r.ok) { window.alert(r.msg || "Error guardando decisión"); return; }
    window.alert("Decisión guardada");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-neutral-400 text-xs">
        <div className="w-4 h-4 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        Cargando bloque 8…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen financiero */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-[#1A3557] to-[#023A4B] flex items-center gap-3">
          <span className="text-lg shrink-0">💶</span>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-white mb-0">Resumen financiero del caso</p>
            <p className="text-[11px] text-white/60">Datos internos — no visibles por el cliente</p>
          </div>
          {guardandoResumen && <span className="text-[10px] text-white/50 font-mono shrink-0">Guardando…</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 py-3 bg-white">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">
              Inversión total másteres
            </label>
            <div className="relative">
              <input
                type="text"
                value={resumen.inversion_total}
                onChange={(e) => setResumen((r) => ({ ...r, inversion_total: e.target.value }))}
                onBlur={guardarResumen}
                placeholder="Ej: 5.600"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 pr-7 text-sm text-neutral-800 outline-none focus:border-[#1A3557] transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">€</span>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">
              Plan contratado
            </label>
            <input
              type="text"
              value={resumen.plan_contratado}
              onChange={(e) => setResumen((r) => ({ ...r, plan_contratado: e.target.value }))}
              onBlur={guardarResumen}
              placeholder="Ej: Plan Comfort"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 outline-none focus:border-[#1A3557] transition"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-1">
              Matrícula más económica
            </label>
            <div className="relative">
              <input
                type="text"
                value={resumen.matricula_minima}
                onChange={(e) => setResumen((r) => ({ ...r, matricula_minima: e.target.value }))}
                onBlur={guardarResumen}
                placeholder="Ej: 1.600"
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 pr-7 text-sm text-neutral-800 outline-none focus:border-[#1A3557] transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">€</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-600">
        Resumen de másteres admitidos/matriculados y decisión final del cliente.
      </p>
      {masters.length === 0 && (
        <p className="text-xs text-neutral-500">No hay másteres admitidos o matriculados todavía.</p>
      )}
      {masters.map((m, idx) => (
        <div key={m.id_acceso_portal} className="border border-neutral-200 rounded-xl p-3 text-xs space-y-3">
          <div className="flex justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900">
                {m.master_label ? `${m.master_label} – ${m.organismo}` : m.organismo}
              </p>
              <p className="text-neutral-500 mt-0.5">
                Estado portal: <span className="font-medium text-neutral-700">{m.estado_tramite}</span>
              </p>
            </div>
            <div className="text-right space-y-1 shrink-0">
              {m.carta_admision && (
                <a
                  href={`/portales/justificantes/${m.carta_admision.id_justificante}/descargar`}
                  className="block text-[11px] text-emerald-700 underline"
                >
                  Ver carta de admisión
                </a>
              )}
              {m.comprobante_pago && (
                <a
                  href={`/portales/justificantes/${m.comprobante_pago.id_justificante}/descargar`}
                  className="block text-[11px] text-emerald-700 underline"
                >
                  Ver comprobante de pago
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <div>
              <label className="block font-medium mb-1">Decisión del cliente</label>
              <select
                className="w-full border border-neutral-300 rounded-lg px-2 py-1 text-xs"
                value={m.decision_cliente || ""}
                onChange={(e) => handleChange(idx, "decision_cliente", e.target.value || null)}
              >
                <option value="">Sin decidir</option>
                {DECISIONES.map((d) => (
                  <option key={d} value={d}>{labelDecision(d)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={!!m.es_master_final}
                  onChange={(e) => handleChange(idx, "es_master_final", e.target.checked)}
                />
                Marcar como máster final del caso
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave(idx)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition"
              >
                Guardar decisión
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Notas sobre pagos / reserva / matrícula</label>
            <textarea
              rows={2}
              className="w-full border border-neutral-300 rounded-lg px-2 py-1 text-xs"
              value={m.info_pagos || ""}
              onChange={(e) => handleChange(idx, "info_pagos", e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
