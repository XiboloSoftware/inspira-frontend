import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const VIDA_LABEL = { economico: "Económico", equilibrado: "Equilibrado", ambicioso: "Ambicioso" };

export default function LeadsCalculadora() {
  const [leads, setLeads]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [filtroPais, setFiltroPais] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const PAGE_SIZE = 50;

  useEffect(() => { cargar(); }, [page, filtroPais, filtroArea]); // eslint-disable-line

  async function cargar() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (filtroPais) params.set("pais", filtroPais);
      if (filtroArea) params.set("area", filtroArea);
      const data = await boGET(`/backoffice/calculadora/leads?${params}`);
      if (data.ok) {
        setLeads(data.leads);
        setTotal(data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }

  function fmtFecha(iso) {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Cabecera */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Calculadora — Leads</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{total} registros totales</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="País…"
          value={filtroPais}
          onChange={e => { setFiltroPais(e.target.value); setPage(1); }}
        />
        <input
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Área de estudio…"
          value={filtroArea}
          onChange={e => { setFiltroArea(e.target.value); setPage(1); }}
        />
        {(filtroPais || filtroArea) && (
          <button
            onClick={() => { setFiltroPais(""); setFiltroArea(""); setPage(1); }}
            className="px-4 py-2 text-sm text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* ── Móvil: cards ── */}
      <div className="sm:hidden space-y-3">
        {loading && <p className="text-center text-neutral-400 py-8 text-sm">Cargando…</p>}
        {!loading && leads.length === 0 && <p className="text-center text-neutral-400 py-8 text-sm">Sin leads todavía.</p>}
        {!loading && leads.map((l) => (
          <div key={l.id_lead} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-primary text-sm">{l.nombre}</p>
                <p className="text-xs text-neutral-400">{l.pais} · {fmtFecha(l.fecha_creacion)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-light text-primary font-medium whitespace-nowrap">
                {VIDA_LABEL[l.vida] ?? l.vida}
              </span>
            </div>

            {l.area && <p className="text-xs text-neutral-600 truncate">{l.area}</p>}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="text-neutral-500">Nota ES: <b>{Number(l.nota_espana).toFixed(2)}</b></span>
              <span className="text-neutral-500">Presupuesto: <b>{l.presupuesto.toLocaleString("es-ES")} €</b></span>
              {l.auip === "si" && <span className="text-emerald-600 font-medium">✓ AUIP</span>}
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {l.email && (
                <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline truncate">{l.email}</a>
              )}
              {l.whatsapp && (
                <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                  📱 {l.whatsapp}
                </a>
              )}
            </div>

            {l.becas_califica && l.becas_califica.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {l.becas_califica.filter(b => b.estado === "si").map((b, i) => (
                  <span key={i} className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full">✓ {b.nombre.split("—")[0].trim()}</span>
                ))}
                {l.becas_califica.filter(b => b.estado === "posible").slice(0, 3).map((b, i) => (
                  <span key={i} className="bg-yellow-100 text-yellow-700 text-[11px] px-2 py-0.5 rounded-full">~ {b.nombre.split("—")[0].trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-secondary-light text-primary text-left">
              {["Fecha", "Nombre", "País", "Nota ES", "Área", "Presupuesto", "Perfil", "AUIP", "Email", "WhatsApp", "Becas"].map(h => (
                <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-neutral-400">Cargando...</td></tr>
            )}
            {!loading && leads.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-neutral-400">Sin leads todavía.</td></tr>
            )}
            {!loading && leads.map((l, i) => (
              <tr key={l.id_lead} className={`border-t border-neutral-100 hover:bg-secondary-light/50 transition ${i % 2 === 0 ? "" : "bg-neutral-50/40"}`}>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{fmtFecha(l.fecha_creacion)}</td>
                <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{l.nombre}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.pais}</td>
                <td className="px-4 py-3 font-semibold text-center">{Number(l.nota_espana).toFixed(2)}</td>
                <td className="px-4 py-3 max-w-[140px] truncate" title={l.area}>{l.area}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.presupuesto.toLocaleString("es-ES")} €</td>
                <td className="px-4 py-3 whitespace-nowrap">{VIDA_LABEL[l.vida] ?? l.vida}</td>
                <td className="px-4 py-3 text-center">{l.auip === "si" ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-neutral-300">—</span>}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {l.email ? <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs">{l.email}</a> : <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {l.whatsapp ? <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs">{l.whatsapp}</a> : <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-4 py-3"><BecasPills becas={l.becas_califica} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-between text-sm">
          <span className="text-neutral-400 text-xs">Pág. {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm"
            >
              ← Anterior
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BecasPills({ becas }) {
  if (!becas || becas.length === 0) return <span className="text-neutral-300">—</span>;
  const califica = becas.filter(b => b.estado === "si");
  const posible  = becas.filter(b => b.estado === "posible");
  return (
    <div className="flex flex-wrap gap-1">
      {califica.map((b, i) => (
        <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
          ✓ {b.nombre.split("—")[0].trim()}
        </span>
      ))}
      {posible.map((b, i) => (
        <span key={i} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
          ~ {b.nombre.split("—")[0].trim()}
        </span>
      ))}
    </div>
  );
}
