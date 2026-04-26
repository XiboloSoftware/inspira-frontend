import { useEffect, useState } from "react";
import { boGet } from "../../../services/backofficeApi";

const VIDA_LABEL = { economico: "Económico", equilibrado: "Equilibrado", ambicioso: "Ambicioso" };
const AUIP_LABEL = { si: "✓ Sí", no: "No" };

export default function LeadsCalculadora() {
  const [leads, setLeads]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);
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
      const data = await boGet(`/backoffice/calculadora/leads?${params}`);
      if (data.ok) {
        setLeads(data.leads);
        setTotal(data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }

  function fmtFecha(iso) {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Calculadora — Leads</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{total} registros totales</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-40 outline-none focus:border-primary"
          placeholder="País..."
          value={filtroPais}
          onChange={e => { setFiltroPais(e.target.value); setPage(1); }}
        />
        <input
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-52 outline-none focus:border-primary"
          placeholder="Área..."
          value={filtroArea}
          onChange={e => { setFiltroArea(e.target.value); setPage(1); }}
        />
        {(filtroPais || filtroArea) && (
          <button
            onClick={() => { setFiltroPais(""); setFiltroArea(""); setPage(1); }}
            className="text-sm text-neutral-500 hover:text-primary underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary-light text-primary text-left">
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">País</th>
              <th className="px-4 py-3 font-semibold">Nota ES</th>
              <th className="px-4 py-3 font-semibold">Área</th>
              <th className="px-4 py-3 font-semibold">Presupuesto</th>
              <th className="px-4 py-3 font-semibold">Perfil</th>
              <th className="px-4 py-3 font-semibold">AUIP</th>
              <th className="px-4 py-3 font-semibold">Universidad</th>
              <th className="px-4 py-3 font-semibold">Becas</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-neutral-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-neutral-400">
                  Sin leads todavía.
                </td>
              </tr>
            )}
            {!loading && leads.map((l, i) => (
              <tr
                key={l.id_lead}
                className={`border-t border-neutral-100 hover:bg-secondary-light/50 transition ${i % 2 === 0 ? "" : "bg-neutral-50/40"}`}
              >
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{fmtFecha(l.fecha_creacion)}</td>
                <td className="px-4 py-3 font-medium text-primary">{l.nombre}</td>
                <td className="px-4 py-3">{l.pais}</td>
                <td className="px-4 py-3 font-semibold text-center">{Number(l.nota_espana).toFixed(2)}</td>
                <td className="px-4 py-3 max-w-[160px] truncate" title={l.area}>{l.area}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.presupuesto.toLocaleString("es-ES")} €</td>
                <td className="px-4 py-3">{VIDA_LABEL[l.vida] ?? l.vida}</td>
                <td className="px-4 py-3 text-center">{AUIP_LABEL[l.auip] ?? l.auip}</td>
                <td className="px-4 py-3 max-w-[180px] truncate text-neutral-600" title={l.universidad ?? ""}>
                  {l.universidad || <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <BecasPills becas={l.becas_califica} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition"
          >
            ← Anterior
          </button>
          <span className="text-neutral-500">Pág. {page} de {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition"
          >
            Siguiente →
          </button>
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
