// src/pages/panel/components/mis-servicios/sections/PortalesYJustificantesCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../../../services/api";

function SeccionCliente({ titulo, items }) {
  if (!items || items.length === 0) {
    return (
      <section className="border border-slate-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">{titulo}</h3>
        <p className="text-xs text-slate-500">
          Aún no hay accesos configurados en esta sección.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 rounded-lg p-3 space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{titulo}</h3>
      <div className="space-y-3">
        {items.map((p) => (
          <div
            key={p.id_acceso}
            className="border border-slate-200 rounded-md p-3 space-y-1 text-xs"
          >
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {p.organismo}
                  {p.master_label ? ` – ${p.master_label}` : ""}
                </p>
                <p className="text-slate-500">
                  {p.tipo_tramite} · Estado:{" "}
                  <span className="font-medium">{p.estado_tramite}</span>
                </p>
              </div>
              {p.url_acceso && (
                <a
                  href={p.url_acceso}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#023A4B] underline"
                >
                  Abrir portal
                </a>
              )}
            </div>

            {p.usuario_login && (
              <p>
                <span className="font-medium">Usuario:</span> {p.usuario_login}
              </p>
            )}

            {p.password && (
              <details className="text-xs">
                <summary className="cursor-pointer text-[#023A4B]">
                  Ver contraseña
                </summary>
                <p className="mt-1 font-mono text-[11px]">{p.password}</p>
              </details>
            )}

            {p.justificantes && p.justificantes.length > 0 && (
              <div className="border-t border-slate-200 mt-2 pt-2">
                <p className="font-semibold mb-1">Justificantes</p>
                <ul className="space-y-1">
                  {p.justificantes.map((j) => (
                    <li key={j.id_justificante}>
                      <span className="mr-1">{j.tipo_justificante}</span>
                      <a
                        href={`/portales/justificantes/${j.id_justificante}/descargar`}
                        className="text-[11px] text-[#023A4B] underline"
                      >
                        Ver PDF
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
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
        if (!r.ok) {
          if (!cancelled)
            setError(
              r.message || r.msg || "No se pudo cargar la información de portales."
            );
          return;
        }
        if (!cancelled) {
          setMinisterios(r.ministerios || []);
          setMasters(r.masters || []);
        }
      } catch (e) {
        if (!cancelled)
          setError(
            "No se pudo cargar la información de portales y justificantes."
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

  if (loading) {
    return (
      <section className="border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-slate-500">
          Cargando portales, claves y justificantes…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border border-slate-200 rounded-lg p-3">
        <p className="text-xs text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">
        7. Portales, claves y justificantes
      </h2>
      <SeccionCliente
        titulo="7.1 Tus accesos a ministerios"
        items={ministerios}
      />
      <SeccionCliente
        titulo="7.2 Tus accesos a portales de máster"
        items={masters}
      />
    </div>
  );
}
