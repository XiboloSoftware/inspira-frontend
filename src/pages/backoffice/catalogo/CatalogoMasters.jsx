// CatalogoMasters.jsx — contenedor principal del módulo Catálogo
//
// Jerarquía de precios:
//   CatComunidadAutonoma.precio_credito_extranjero  (€/crédito fijado por la CCAA)
//       └── CatUniversidad  (hereda el precio al pertenecer a una CCAA)
//               └── CatMaster.precio_total_estimado = ects × precio_credito_extranjero
//
// Este componente carga comunidades y universidades una vez y las comparte
// entre las secciones para evitar llamadas repetidas a la API.

import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import SeccionComunidades  from "./SeccionComunidades";
import SeccionUniversidades from "./SeccionUniversidades";
import SeccionMasters       from "./SeccionMasters";

const TABS = [
  { key: "comunidades",   label: "Comunidades Autónomas" },
  { key: "universidades", label: "Universidades" },
  { key: "masters",       label: "Másteres" },
];

export default function CatalogoMasters() {
  const [tab,           setTab]           = useState("comunidades");
  const [comunidades,   setComunidades]   = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const loadDimensiones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rCom, rUni] = await Promise.all([
        boGET("/backoffice/catalogo/comunidades"),
        boGET("/backoffice/catalogo/universidades"),
      ]);
      if (rCom.ok) setComunidades(rCom.comunidades);
      if (rUni.ok) setUniversidades(rUni.universidades);
    } catch (e) {
      setError("Error cargando datos del catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDimensiones(); }, [loadDimensiones]);

  const countCom = comunidades.length;
  const countUni = universidades.length;

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="px-6 pt-6 pb-0 shrink-0">
        <h1 className="text-xl font-bold text-neutral-900">Catálogo de Másteres</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gestión de comunidades autónomas, universidades y másteres.{" "}
          <span className="text-neutral-400">precio = ECTS × €/crédito CCAA</span>
        </p>

        {/* Pestañas */}
        <div className="flex gap-1 mt-5 border-b border-neutral-200">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count  = t.key === "comunidades" ? countCom : t.key === "universidades" ? countUni : null;
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

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex items-center justify-center h-40 text-neutral-400">
            Cargando catálogo…
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={loadDimensiones}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === "comunidades" && (
              <SeccionComunidades
                comunidades={comunidades}
                onReload={loadDimensiones}
              />
            )}
            {tab === "universidades" && (
              <SeccionUniversidades
                universidades={universidades}
                comunidades={comunidades}
                onReload={loadDimensiones}
              />
            )}
            {tab === "masters" && (
              <SeccionMasters
                universidades={universidades}
                comunidades={comunidades}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
