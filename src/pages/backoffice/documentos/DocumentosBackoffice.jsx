// src/pages/backoffice/documentos/DocumentosBackoffice.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";
import { getUser } from "./documentosUtils";
import { TreeNode, SolicitudNode } from "./DocumentosTree";

function countDocs(lista) {
  return lista.reduce(
    (a, c) => a + c.solicitudes.reduce((b, s) => b + s.items.reduce((c2, it) => c2 + it.documentos.length, 0), 0),
    0
  );
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
        .filter((s) => s.items.length > 0),
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

export default function DocumentosBackoffice() {
  const [clientes, setClientes] = useState([]);
  const [internos, setInternos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [expandedMap, setExpandedMap] = useState({});
  const [tab, setTab] = useState("clientes");

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

  const q = busqueda.toLowerCase().trim();
  const clientesFiltrados = filtrarLista(clientes, q);
  const internosFiltrados = filtrarLista(internos, q);

  const totalDocs = countDocs(clientes) + countDocs(internos);
  const totalClienteDocs = countDocs(clientes);
  const totalInternoDocs = countDocs(internos);

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

  const tabConfig = {
    clientes: { color: "indigo", icon: "👥", label: "Clientes", lista: clientesFiltrados, count: countDocs(clientesFiltrados), total: totalClienteDocs, idKey: "id_cliente" },
    equipo:   { color: "teal",   icon: "🏢", label: "Equipo",   lista: internosFiltrados, count: countDocs(internosFiltrados), total: totalInternoDocs, idKey: "id_usuario"  },
  };

  const activeTab = tabConfig[tab];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Documentos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestión centralizada de archivos</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cliente, solicitud…"
            className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button onClick={cargar} title="Recargar" className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-500 text-base">↻</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
          <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">Total archivos</p>
          <p className="text-3xl font-bold text-neutral-800">{loading ? "…" : totalDocs}</p>
        </div>
        {Object.entries(tabConfig).map(([key, cfg]) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
              tab === key
                ? `bg-${cfg.color}-50 border-${cfg.color}-300 ring-1 ring-${cfg.color}-300`
                : "bg-white border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">{cfg.label}</p>
            <p className={`text-3xl font-bold ${tab === key ? `text-${cfg.color}-700` : "text-neutral-800"}`}>
              {loading ? "…" : cfg.total}
            </p>
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      {/* Tarjeta principal */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Pestañas */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2 gap-1">
          {Object.entries(tabConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                tab === key
                  ? `border-${cfg.color}-500 text-${cfg.color}-600 bg-white`
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {cfg.icon} {cfg.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                tab === key ? `bg-${cfg.color}-100 text-${cfg.color}-600` : "bg-neutral-200 text-neutral-500"
              }`}>
                {loading ? "…" : cfg.count}
              </span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="p-4 min-h-[300px]">
          {loading && (
            <div className="py-20 text-center text-neutral-400 text-sm">
              <div className="text-4xl mb-3">📂</div>
              Cargando documentos…
            </div>
          )}

          {!loading && activeTab.lista.length === 0 && (
            <div className="py-16 text-center text-neutral-400 text-sm">
              <div className="text-4xl mb-3">🔍</div>
              {q ? "Sin resultados para esta búsqueda." : `No hay documentos de ${activeTab.label.toLowerCase()} aún.`}
            </div>
          )}

          {!loading && activeTab.lista.length > 0 && (
            <div className="space-y-0.5">
              {activeTab.lista.map((entry) => {
                const id = entry[activeTab.idKey];
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
                        key={sol.id_solicitud}
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
      </div>
    </div>
  );
}
