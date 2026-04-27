// src/pages/panel/components/mis-servicios/sections/PortalesYJustificantesCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";

function AccesoCard({ item }) {
  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900">
            {item.organismo}{item.master_label ? ` — ${item.master_label}` : ""}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {item.tipo_tramite} · Estado:{" "}
            <span className="font-semibold text-neutral-700">{item.estado_tramite}</span>
          </p>
        </div>
        {item.url_acceso && (
          <a
            href={item.url_acceso}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 border-[#023A4B] text-[#023A4B] bg-white hover:bg-[#023A4B] hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Abrir portal
          </a>
        )}
      </div>

      {(item.usuario_login || item.password) && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 space-y-1.5">
          {item.usuario_login && (
            <p className="text-xs text-neutral-700">
              <span className="font-semibold">Usuario:</span>{" "}
              <span className="font-mono">{item.usuario_login}</span>
            </p>
          )}
          {item.password && (
            <details className="text-xs">
              <summary className="cursor-pointer text-sm font-semibold text-[#023A4B] select-none">Ver contraseña</summary>
              <p className="mt-1.5 font-mono text-sm bg-white border border-neutral-200 rounded px-2 py-1">{item.password}</p>
            </details>
          )}
        </div>
      )}

      {item.justificantes && item.justificantes.length > 0 && (
        <div className="border-t border-neutral-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Justificantes</p>
          <ul className="space-y-1.5">
            {item.justificantes.map((j) => (
              <li key={j.id_justificante} className="flex items-center justify-between gap-2">
                <span className="text-sm text-neutral-700">{j.tipo_justificante}</span>
                <a href={`/portales/justificantes/${j.id_justificante}/descargar`} className="text-sm font-semibold text-[#023A4B] hover:underline">
                  Ver PDF
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SubSeccion({ numero, titulo, items }) {
  return (
    <div>
      <p className="text-sm font-bold text-neutral-700 mb-3">{numero} {titulo}</p>
      {!items || items.length === 0 ? (
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-4">
          <p className="text-sm text-neutral-400">Aún no hay accesos configurados en esta sección.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => <AccesoCard key={p.id_acceso} item={p} />)}
        </div>
      )}
    </div>
  );
}

export default function PortalesYJustificantesCliente({ idSolicitud }) {
  const [ministerios, setMinisterios] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const r = await apiGET(`/portales/panel/solicitudes/${idSolicitud}`);
        if (!r.ok) { if (!cancelled) setError(r.message || r.msg || "No se pudo cargar portales."); return; }
        if (!cancelled) { setMinisterios(r.ministerios || []); setMasters(r.masters || []); }
      } catch { if (!cancelled) setError("No se pudo cargar la información de portales."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const total = ministerios.length + masters.length;
  const subtitulo = loading
    ? "Cargando…"
    : total > 0
    ? `${total} acceso${total > 1 ? "s" : ""} configurado${total > 1 ? "s" : ""}`
    : "Tus accesos a ministerios y portales universitarios.";

  return (
    <SeccionPanel
      numero="7"
      titulo="Portales, claves y justificantes"
      subtitulo={subtitulo}
    >
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-[#046C8C] rounded-full animate-spin" />
          <span className="text-sm">Cargando portales…</span>
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="space-y-6">
          <SubSeccion numero="7.1" titulo="Tus accesos a ministerios" items={ministerios} />
          <SubSeccion numero="7.2" titulo="Tus accesos a portales de máster" items={masters} />
        </div>
      )}
    </SeccionPanel>
  );
}
