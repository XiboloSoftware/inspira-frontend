// SeccionCriterios.jsx — Vista global de todos los criterios de admisión
import { useCallback, useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { CATEGORIAS_CRITERIO } from "./catalogoConstants";

const LIMIT = 50;

function categoriaCls(cat) {
  return CATEGORIAS_CRITERIO.find((c) => c.value === cat)?.color || "bg-neutral-100 text-neutral-600 border-neutral-200";
}
function categoriaLabel(cat) {
  return CATEGORIAS_CRITERIO.find((c) => c.value === cat)?.label || cat || "—";
}

export default function SeccionCriterios({ universidades }) {
  const [criterios,  setCriterios]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [filtroCat,  setFiltroCat]  = useState("");
  const [filtroUniv, setFiltroUniv] = useState("");

  const fetchCriterios = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:           String(overrides.page      ?? page),
        limit:          String(LIMIT),
        search:         overrides.search           !== undefined ? overrides.search     : search,
        categoria:      overrides.filtroCat        !== undefined ? overrides.filtroCat  : filtroCat,
        id_universidad: overrides.filtroUniv       !== undefined ? overrides.filtroUniv : filtroUniv,
      });
      ["search", "categoria", "id_universidad"].forEach((k) => { if (!q.get(k)) q.delete(k); });
      const data = await boGET(`/backoffice/catalogo/criterios?${q}`);
      if (data.ok) { setCriterios(data.criterios); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, search, filtroCat, filtroUniv]);

  useEffect(() => { fetchCriterios(); }, [fetchCriterios]);

  function handleFilter(key, val, setter) { setter(val); setPage(1); fetchCriterios({ page: 1, [key]: val }); }
  function applySearch() { setPage(1); fetchCriterios({ page: 1, search }); }
  function resetSearch() { setSearch(""); setPage(1); fetchCriterios({ page: 1, search: "" }); }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Criterios de admisión</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Criterios de todos los másteres del catálogo
            {total > 0 && <span className="ml-2 font-medium text-neutral-400">— {total} registros</span>}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-1">
          <input
            className="flex-1 border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            placeholder="Buscar por descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()} />
          <button onClick={applySearch}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium">
            Buscar
          </button>
          {search && (
            <button onClick={resetSearch}
              className="px-2.5 py-1.5 text-sm text-neutral-400 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition">✕</button>
          )}
        </div>
        <select
          className="border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          value={filtroCat}
          onChange={(e) => handleFilter("filtroCat", e.target.value, setFiltroCat)}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS_CRITERIO.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          className="border border-neutral-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          value={filtroUniv}
          onChange={(e) => handleFilter("filtroUniv", e.target.value, setFiltroUniv)}>
          <option value="">Todas las universidades</option>
          {universidades.map((u) => (
            <option key={u.id_universidad} value={u.id_universidad}>{u.sigla} — {u.nombre_completo}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-[11px] text-neutral-400 uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2.5 w-[180px]">Categoría</th>
              <th className="text-left px-3 py-2.5">Descripción</th>
              <th className="text-center px-3 py-2.5 w-[64px]">Peso %</th>
              <th className="text-left px-3 py-2.5 w-[220px]">Máster</th>
              <th className="text-left px-3 py-2.5 w-[90px]">Universidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr><td colSpan={5} className="text-center py-12 text-neutral-400">
                <div className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Cargando…
                </div>
              </td></tr>
            )}
            {!loading && criterios.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                Sin criterios para los filtros seleccionados.
              </td></tr>
            )}
            {!loading && criterios.map((c) => (
              <tr key={c.id_criterio} className="hover:bg-neutral-50/80 transition-colors">
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoriaCls(c.categoria)}`}>
                    {categoriaLabel(c.categoria)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-neutral-700 text-xs leading-relaxed">
                  {c.descripcion || <span className="text-neutral-300 italic">—</span>}
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums font-bold text-neutral-600 text-xs">
                  {c.peso_porcentaje != null
                    ? `${Number(c.peso_porcentaje)}%`
                    : <span className="text-neutral-300 font-normal">—</span>}
                </td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <p className="truncate text-xs font-medium text-neutral-700" title={c.master?.nombre_limpio}>
                    {c.master?.nombre_limpio}
                  </p>
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-mono text-[11px] font-bold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                    {c.master?.universidad?.sigla}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-neutral-500">Página {page} de {totalPages} · {total} criterios</span>
          <div className="flex gap-2">
            <button disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchCriterios({ page: p }); }}
              className="px-3 py-1.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition text-sm">
              ← Anterior
            </button>
            <button disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); fetchCriterios({ page: p }); }}
              className="px-3 py-1.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-40 transition text-sm">
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
