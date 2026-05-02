// CatalogoMasters.jsx — contenedor principal del módulo Catálogo
import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import SeccionRamas         from "./SeccionRamas";
import SeccionComunidades   from "./SeccionComunidades";
import SeccionUniversidades from "./SeccionUniversidades";
import SeccionMasters       from "./SeccionMasters";
import SeccionCriterios     from "./SeccionCriterios";

const TABS = [
  { key: "ramas",         label: "Ramas" },
  { key: "comunidades",   label: "Comunidades Autónomas" },
  { key: "universidades", label: "Universidades" },
  { key: "masters",       label: "Másteres" },
  { key: "criterios",     label: "Criterios" },
];

export default function CatalogoMasters() {
  const [tab,           setTab]           = useState("ramas");
  const [ramas,         setRamas]         = useState([]);
  const [comunidades,   setComunidades]   = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rRamas, rCom, rUni] = await Promise.all([
        boGET("/backoffice/catalogo/ramas"),
        boGET("/backoffice/catalogo/comunidades"),
        boGET("/backoffice/catalogo/universidades"),
      ]);
      if (rRamas.ok) setRamas(rRamas.ramas);
      if (rCom.ok)   setComunidades(rCom.comunidades);
      if (rUni.ok)   setUniversidades(rUni.universidades);
    } catch (e) {
      setError("Error cargando datos del catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const counts = {
    ramas:         ramas.length,
    comunidades:   comunidades.length,
    universidades: universidades.length,
    masters:       null,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-0 shrink-0">
        <h1 className="text-xl font-bold text-neutral-900">Catálogo de Másteres</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Ramas · Comunidades Autónomas · Universidades · Másteres
          <span className="ml-2 text-neutral-400">precio = ECTS × €/crédito CCAA</span>
        </p>

        <div className="flex gap-1 mt-5 border-b border-neutral-200">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count  = counts[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  "relative px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg",
                  active
                    ? "text-primary border-b-2 border-primary bg-white -mb-px"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50",
                ].join(" ")}
              >
                {t.label}
                {count != null && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex items-center justify-center h-40 text-neutral-400">Cargando catálogo…</div>
        )}
        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-600 mb-3">{error}</p>
            <button onClick={loadAll} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition">Reintentar</button>
          </div>
        )}
        {!loading && !error && (
          <>
            {tab === "ramas"         && <SeccionRamas         ramas={ramas}                   onReload={loadAll} />}
            {tab === "comunidades"   && <SeccionComunidades   comunidades={comunidades}        onReload={loadAll} />}
            {tab === "universidades" && <SeccionUniversidades universidades={universidades} comunidades={comunidades} onReload={loadAll} />}
            {tab === "masters"       && <SeccionMasters    universidades={universidades} comunidades={comunidades} ramas={ramas} />}
            {tab === "criterios"     && <SeccionCriterios  universidades={universidades} />}
          </>
        )}
      </div>
    </div>
  );
}
