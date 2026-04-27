// src/pages/backoffice/documentos/DocumentosBackoffice.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { getUser } from "./documentosUtils";
import { TreeNode, SolicitudNode } from "./DocumentosTree";

function countDocs(lista) {
  return lista.reduce(
    (a, c) =>
      a +
      c.solicitudes.reduce(
        (b, s) =>
          b +
          s.items.reduce((c2, it) => c2 + it.documentos.length, 0) +
          (s.informe ? 1 : 0) +
          (s.justificantes?.length || 0),
        0
      ),
    0
  );
}

function countByEstado(lista) {
  const counts = { APROBADO: 0, OBSERVADO: 0, SUBIDO: 0 };
  for (const c of lista) {
    for (const s of c.solicitudes) {
      for (const it of s.items) {
        for (const doc of it.documentos) {
          const e = doc.estado_revision;
          if (e === "APROBADO") counts.APROBADO++;
          else if (e === "OBSERVADO") counts.OBSERVADO++;
          else counts.SUBIDO++;
        }
      }
    }
  }
  return counts;
}

function hasDocWithEstado(entry, filtro) {
  for (const s of entry.solicitudes) {
    for (const it of s.items) {
      for (const doc of it.documentos) {
        if (filtro === "SUBIDO") {
          if (doc.estado_revision !== "APROBADO" && doc.estado_revision !== "OBSERVADO") return true;
        } else {
          if (doc.estado_revision === filtro) return true;
        }
      }
    }
  }
  return false;
}

function filtrarLista(lista, q) {
  if (!q) return lista;
  return lista
    .map((c) => ({
      ...c,
      solicitudes: c.solicitudes
        .map((s) => ({
          ...s,
          items: s.items
            .map((it) => ({
              ...it,
              documentos: it.documentos.filter(
                (d) =>
                  d.nombre_original.toLowerCase().includes(q) ||
                  it.nombre.toLowerCase().includes(q) ||
                  s.titulo.toLowerCase().includes(q) ||
                  c.nombre.toLowerCase().includes(q) ||
                  (c.email && c.email.toLowerCase().includes(q))
              ),
            }))
            .filter((it) => it.documentos.length > 0),
        }))
        .filter((s) => s.items.length > 0 || s.informe || (s.justificantes?.length ?? 0) > 0),
    }))
    .filter((c) => c.solicitudes.length > 0);
}

function eliminarDocDeEstructura(lista, idDocumento) {
  return lista.map((entry) => ({
    ...entry,
    solicitudes: entry.solicitudes.map((s) => ({
      ...s,
      items: s.items.map((it) => ({
        ...it,
        documentos: it.documentos.filter((d) => d.id_documento !== idDocumento),
      })),
    })),
  }));
}

const POR_PAGINA = 20;

const FILTROS = [
  {
    key: "APROBADO",
    label: "Aprobados",
    icon: "✅",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    subtext: "text-green-600",
    activeBg: "bg-green-500",
    activeBorder: "border-green-600",
    activeText: "text-white",
  },
  {
    key: "OBSERVADO",
    label: "Observados",
    icon: "⚠️",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    subtext: "text-yellow-600",
    activeBg: "bg-yellow-500",
    activeBorder: "border-yellow-600",
    activeText: "text-white",
  },
  {
    key: "SUBIDO",
    label: "Sin revisar",
    icon: "📤",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    subtext: "text-blue-600",
    activeBg: "bg-blue-500",
    activeBorder: "border-blue-600",
    activeText: "text-white",
  },
];

export default function DocumentosBackoffice() {
  const [clientes, setClientes] = useState([]);
  const [internos, setInternos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [expandedMap, setExpandedMap] = useState({});
  const [pagina, setPagina] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState(null);

  const usuario = getUser();
  const isAdmin = usuario?.rol === "admin";

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    setError("");
    const r = await boGET("/backoffice/documentos");
    if (r.ok) {
      setClientes(r.clientes || []);
      setInternos(r.internos || []);
    } else {
      setError(r.msg || "No se pudieron cargar los documentos");
    }
    setLoading(false);
  }

  function handleEliminarGlobal(idDocumento) {
    setClientes((prev) => eliminarDocDeEstructura(prev, idDocumento));
    setInternos((prev) => eliminarDocDeEstructura(prev, idDocumento));
  }

  function toggleExpand(id) {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const todos = [...clientes, ...internos].sort((a, b) =>
    (a.nombre || "").localeCompare(b.nombre || "")
  );

  const q = busqueda.toLowerCase().trim();
  let listaFiltrada = filtrarLista(todos, q);
  if (filtroEstado) {
    listaFiltrada = listaFiltrada.filter((e) => hasDocWithEstado(e, filtroEstado));
  }

  useEffect(() => { setPagina(0); }, [busqueda, filtroEstado]);

  const totalDocs = countDocs(todos);
  const estadoCounts = countByEstado(todos);
  const totalPaginas = Math.ceil(listaFiltrada.length / POR_PAGINA);
  const listaVisible = listaFiltrada.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  function ExpandBtn({ id }) {
    return (
      <button
        onClick={() => toggleExpand(id)}
        title={expandedMap[id] ? "Contraer todo" : "Expandir todo"}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors shrink-0 leading-none ${
          expandedMap[id]
            ? "border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100"
            : "border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
        }`}
      >
        {expandedMap[id] ? "−" : "+"}
      </button>
    );
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-7xl mx-auto" style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Documentos</h1>
          <p className="text-sm text-neutral-500">Gestión centralizada de archivos</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cliente, solicitud…"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button onClick={cargar} title="Recargar" className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-500">
            ↻
          </button>
        </div>
      </div>

      {error && (
        <div className="shrink-0 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Layout: sidebar + panel */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-48 shrink-0 flex flex-col gap-3 overflow-y-auto">
          {/* Total */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">Total archivos</p>
            <p className="text-3xl font-bold text-neutral-800">{loading ? "…" : totalDocs}</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              {loading ? "" : `${listaFiltrada.length} clientes`}
            </p>
          </div>

          {/* Stats clickables = filtros */}
          {FILTROS.map((f) => {
            const active = filtroEstado === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(active ? null : f.key)}
                className={`rounded-xl border shadow-sm p-4 text-left transition-all ${
                  active
                    ? `${f.activeBg} ${f.activeBorder} ring-2 ring-offset-1 ring-${f.key === "APROBADO" ? "green" : f.key === "OBSERVADO" ? "yellow" : "blue"}-400`
                    : `${f.bg} ${f.border} hover:brightness-95`
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm leading-none">{f.icon}</span>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${active ? f.activeText : f.subtext}`}>
                    {f.label}
                  </p>
                </div>
                <p className={`text-2xl font-bold ${active ? f.activeText : f.text}`}>
                  {loading ? "…" : estadoCounts[f.key]}
                </p>
                {active && (
                  <p className="text-[10px] text-white/80 mt-0.5">Clic para quitar</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel principal */}
        <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col min-h-0">
          {/* Cabecera del panel */}
          <div className="shrink-0 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50 rounded-t-xl flex items-center gap-2 flex-wrap">
            <span className="text-xs text-neutral-500 font-medium">
              {filtroEstado
                ? `Mostrando clientes con documentos ${FILTROS.find((f) => f.key === filtroEstado)?.label.toLowerCase()}`
                : `${listaFiltrada.length} clientes · ${countDocs(listaFiltrada)} archivos`}
            </span>
            {filtroEstado && (
              <button
                onClick={() => setFiltroEstado(null)}
                className="text-[11px] px-2 py-0.5 rounded-full border border-neutral-300 text-neutral-500 hover:bg-neutral-100"
              >
                ✕ Quitar filtro
              </button>
            )}
          </div>

          {/* Lista scrollable */}
          <div className="flex-1 overflow-y-auto p-3 min-h-0">
            {loading && (
              <div className="py-20 text-center text-neutral-400 text-sm">
                <div className="text-4xl mb-3">📂</div>
                Cargando documentos…
              </div>
            )}
            {!loading && listaFiltrada.length === 0 && (
              <div className="py-16 text-center text-neutral-400 text-sm">
                <div className="text-4xl mb-3">🔍</div>
                {q || filtroEstado ? "Sin resultados para este filtro." : "No hay documentos aún."}
              </div>
            )}
            {!loading && listaVisible.length > 0 && (
              <div className="space-y-0.5">
                {listaVisible.map((entry) => {
                  const id = entry.id_cliente ?? entry.id_usuario ?? `null-${entry.nombre}`;
                  return (
                    <TreeNode
                      key={id}
                      icon="👤"
                      label={entry.nombre}
                      sublabel={entry.rol ? `${entry.rol} · ${entry.email || ""}` : entry.email}
                      count={countDocs([entry])}
                      forceOpen={expandedMap[id]}
                      headerExtra={<ExpandBtn id={id} />}
                    >
                      {entry.solicitudes.map((sol) => (
                        <SolicitudNode
                          key={sol.id_solicitud ?? sol.titulo}
                          solicitud={sol}
                          isAdmin={isAdmin}
                          onEliminar={handleEliminarGlobal}
                          forceOpen={expandedMap[id]}
                        />
                      ))}
                    </TreeNode>
                  );
                })}
              </div>
            )}
          </div>

          {/* Paginación fija al fondo */}
          {!loading && totalPaginas > 1 && (
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
              <span className="text-xs text-neutral-400">
                Página {pagina + 1} de {totalPaginas} · {listaFiltrada.length} clientes
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="px-3 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                  disabled={pagina >= totalPaginas - 1}
                  className="px-3 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
