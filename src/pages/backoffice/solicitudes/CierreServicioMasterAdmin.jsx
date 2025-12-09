// src/pages/backoffice/solicitudes/CierreServicioMasterAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

const DECISIONES = [
  "ACEPTA_COMO_PRINCIPAL",
  "EN_ESPERA",
  "RECHAZA",
];

function filaLabelDecision(decision) {
  if (!decision) return "Sin decidir";
  switch (decision) {
    case "ACEPTA_COMO_PRINCIPAL":
      return "Acepta como principal";
    case "EN_ESPERA":
      return "En espera";
    case "RECHAZA":
      return "Rechaza";
    default:
      return decision;
  }
}

export default function CierreServicioMasterAdmin({ idSolicitud }) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await boGET(
          `/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8`
        );
        if (!r.ok || !r.masters) return;
        if (!cancelled) setMasters(r.masters);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [idSolicitud]);

  const handleChange = (idx, field, value) => {
    setMasters((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = async (idx) => {
    const row = masters[idx];
    const payload = {
      id_acceso_portal: row.id_acceso_portal,
      decision_cliente: row.decision_cliente,
      es_master_final: row.es_master_final,
      info_pagos: row.info_pagos,
    };

    const r = await boPOST(
      `/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/decisiones`,
      payload
    );
    if (!r.ok) {
      window.alert(r.msg || "Error guardando decisión");
      return;
    }
    window.alert("Decisión guardada");
  };

  if (loading) {
    return (
      <section className="border border-neutral-200 rounded-lg p-3 mt-4 text-xs">
        Cargando Bloque 8…
      </section>
    );
  }

  if (!masters.length) {
    return (
      <section className="border border-neutral-200 rounded-lg p-3 mt-4 text-xs">
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">
          8. Cierre de servicio de máster y siguientes pasos
        </h2>
        <p className="text-xs text-neutral-500">
          No hay másteres admitidos o matriculados todavía.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-neutral-200 rounded-lg p-3 mt-4 space-y-3">
      <h2 className="text-sm font-semibold text-neutral-900">
        8. Cierre de servicio de máster y siguientes pasos
      </h2>
      <p className="text-xs text-neutral-500">
        Resumen de másteres admitidos/matriculados y decisión final del cliente.
      </p>

      <div className="space-y-3">
        {masters.map((m, idx) => (
          <div
            key={m.id_acceso_portal}
            className="border border-neutral-200 rounded-md p-3 text-xs space-y-2"
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold text-neutral-900">
                  {m.master_label
                    ? `${m.master_label} – ${m.organismo}`
                    : m.organismo}
                </p>
                <p className="text-neutral-500">
                  Estado portal:{" "}
                  <span className="font-medium">{m.estado_tramite}</span>
                </p>
              </div>
              <div className="text-right space-y-1">
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
                <label className="block font-medium mb-1">
                  Decisión del cliente
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={m.decision_cliente || ""}
                  onChange={(e) =>
                    handleChange(idx, "decision_cliente", e.target.value || null)
                  }
                >
                  <option value="">Sin decidir</option>
                  {DECISIONES.map((d) => (
                    <option key={d} value={d}>
                      {filaLabelDecision(d)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={!!m.es_master_final}
                    onChange={(e) =>
                      handleChange(idx, "es_master_final", e.target.checked)
                    }
                  />
                  Marcar como máster final del caso
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave(idx)}
                  className="px-3 py-1 rounded bg-emerald-600 text-white text-xs"
                >
                  Guardar decisión
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Notas sobre pagos / reserva / matrícula
              </label>
              <textarea
                rows={2}
                className="w-full border rounded px-2 py-1 text-xs"
                value={m.info_pagos || ""}
                onChange={(e) =>
                  handleChange(idx, "info_pagos", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
