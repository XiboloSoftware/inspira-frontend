// src/pages/panel/components/mis-servicios/sections/CierreServicioMasterCliente.jsx
import { useEffect, useState } from "react";
import { apiGET, apiPOST } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";

export default function CierreServicioMasterCliente({ idSolicitud }) {
  const [masters, setMasters] = useState([]);
  const [masterFinal, setMasterFinal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const r = await apiGET(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8`);
        if (!r.ok) { if (!cancelled) setMsg(r.msg || "No se pudo cargar el resumen final."); return; }
        if (!cancelled) { setMasters(r.masters || []); setMasterFinal(r.master_final || null); }
      } catch { if (!cancelled) setMsg("No se pudo cargar el resumen final."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const handleCTA = async () => {
    try {
      const r = await apiPOST(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/cta-visa`, {});
      window.alert(r.ok ? (r.msg || "Hemos registrado tu interés. Te contactaremos pronto.") : (r.msg || "No se pudo iniciar la asesoría."));
    } catch { window.alert("Error al iniciar la asesoría de visa/estancia."); }
  };

  if (!loading && !msg && !masters.length) return null;

  const subtitulo = loading
    ? "Cargando…"
    : masterFinal
    ? `Admitido en: ${masterFinal.master_label || masterFinal.organismo}`
    : "Resumen de admisiones y siguientes pasos.";

  return (
    <SeccionPanel
      numero="8"
      titulo="Cierre de servicio y siguientes pasos"
      subtitulo={subtitulo}
    >
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-[#046C8C] rounded-full animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {msg && !loading && (
        <p className="text-sm text-red-600">{msg}</p>
      )}

      {!loading && !msg && (
        <div className="space-y-5">
          {masterFinal && (
            <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-900">¡Enhorabuena, has sido admitido/a!</p>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    {masterFinal.master_label ? `${masterFinal.master_label} — ${masterFinal.organismo}` : masterFinal.organismo}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                Con tu carta de admisión y la reserva/matrícula, podemos continuar con tu visa o estancia por estudios.
              </p>
              <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-neutral-900">Condiciones especiales para clientes Inspira</p>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>Servicio estándar de visa/estancia</span>
                  <span className="line-through text-neutral-400">275 €</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-emerald-800">
                  <span>Precio cliente Inspira</span>
                  <span>250 €</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCTA}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Contratar asesoría de visa/estancia (250 €)
                </button>
                <button type="button" className="text-sm font-medium px-5 py-2.5 rounded-xl border-2 border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 transition-all">
                  Lo pensaré más tarde
                </button>
              </div>
            </div>
          )}

          {masters.length > 0 && (
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-3">Másteres admitidos / matriculados</p>
              <div className="space-y-3">
                {masters.map((m) => (
                  <div key={m.id_acceso_portal} className="border border-neutral-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      {m.master_label ? `${m.master_label} — ${m.organismo}` : m.organismo}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Estado: <span className="font-semibold text-neutral-700">{m.estado_tramite}</span>
                    </p>
                    {(m.carta_admision || m.comprobante_pago) && (
                      <div className="flex gap-3 mt-2.5">
                        {m.carta_admision && (
                          <a href={`/portales/justificantes/${m.carta_admision.id_justificante}/descargar`} className="text-sm font-semibold text-[#023A4B] hover:underline">
                            Ver carta de admisión
                          </a>
                        )}
                        {m.comprobante_pago && (
                          <a href={`/portales/justificantes/${m.comprobante_pago.id_justificante}/descargar`} className="text-sm font-semibold text-[#023A4B] hover:underline">
                            Ver comprobante de pago
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SeccionPanel>
  );
}
