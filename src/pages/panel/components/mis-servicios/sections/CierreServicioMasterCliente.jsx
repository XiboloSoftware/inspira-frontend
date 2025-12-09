// src/pages/panel/components/mis-servicios/sections/CierreServicioMasterCliente.jsx
import { useEffect, useState } from "react";
import { apiGET, apiPOST } from "../../../../../services/api";

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
        const r = await apiGET(
          `/cierre-master/panel/solicitudes/${idSolicitud}/bloque8`
        );
        if (!r.ok) {
          if (!cancelled)
            setMsg(
              r.msg ||
                "No se pudo cargar el resumen final de másteres y siguientes pasos."
            );
          return;
        }
        if (!cancelled) {
          setMasters(r.masters || []);
          setMasterFinal(r.master_final || null);
        }
      } catch (e) {
        if (!cancelled)
          setMsg(
            "No se pudo cargar el resumen final de másteres y siguientes pasos."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [idSolicitud]);

  const handleCTA = async () => {
    try {
      const r = await apiPOST(
        `/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/cta-visa`,
        {}
      );
      if (!r.ok) {
        window.alert(r.msg || "No se pudo iniciar la asesoría de visa/estancia.");
        return;
      }
      window.alert(
        r.msg ||
          "Hemos registrado tu interés por la asesoría de visa/estancia. Te contactaremos."
      );
      // Si devuelves una URL de pago en el backend, aquí haces window.location.href = r.url;
    } catch (e) {
      window.alert("No se pudo iniciar la asesoría de visa/estancia.");
    }
  };

  if (loading) {
    return (
      <section className="border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-500">
          Cargando cierre de servicio de máster…
        </p>
      </section>
    );
  }

  if (msg) {
    return (
      <section className="border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-red-600">{msg}</p>
      </section>
    );
  }

  if (!masters.length) {
    return null;
  }

  const hayCTA = !!masterFinal;

  return (
    <section className="border border-slate-200 rounded-lg p-3 space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">
        8. Cierre de servicio de máster y siguientes pasos
      </h2>

      {hayCTA && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-md p-3 text-xs space-y-2">
          <p className="font-semibold text-emerald-900">
            ¡Enhorabuena! Has sido admitid@ en:
          </p>
          <p className="text-emerald-900">
            {masterFinal.master_label
              ? `${masterFinal.master_label} – ${masterFinal.organismo}`
              : masterFinal.organismo}
          </p>
          <p className="text-slate-700">
            Con tu carta de admisión y la reserva/matrícula, ya podemos pasar a
            tu visa o estancia por estudios.
          </p>
          <div className="border border-emerald-200 rounded-md p-2 bg-white">
            <p className="font-semibold text-slate-900 mb-1">
              Condiciones especiales para clientes Inspira:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
              <li>Servicio estándar de visa/estancia: 275 €</li>
              <li>Precio cliente Inspira: 250 €</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCTA}
              className="px-3 py-1 rounded bg-[#023A4B] text-white text-xs"
            >
              Quiero contratar la asesoría de visa/estancia (250 €)
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded border border-slate-300 text-xs text-slate-700 bg-white"
            >
              Quiero pensarlo más tarde
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-900">
          Resumen de másteres admitidos / matriculados
        </p>
        <div className="space-y-2">
          {masters.map((m) => (
            <div
              key={m.id_acceso_portal}
              className="border border-slate-200 rounded-md p-2 text-xs"
            >
              <p className="font-semibold text-slate-900">
                {m.master_label
                  ? `${m.master_label} – ${m.organismo}`
                  : m.organismo}
              </p>
              <p className="text-slate-600">
                Estado del portal:{" "}
                <span className="font-medium">{m.estado_tramite}</span>
              </p>
              {m.carta_admision && (
                <a
                  href={`/portales/justificantes/${m.carta_admision.id_justificante}/descargar`}
                  className="text-[11px] text-[#023A4B] underline mr-3"
                >
                  Ver carta de admisión
                </a>
              )}
              {m.comprobante_pago && (
                <a
                  href={`/portales/justificantes/${m.comprobante_pago.id_justificante}/descargar`}
                  className="text-[11px] text-[#023A4B] underline"
                >
                  Ver comprobante de pago
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
