// src/pages/backoffice/documentos/DocumentosBackoffice.jsx
import { useEffect, useState } from "react";
import { boGET, boDELETE } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getUser() {
  try {
    const u = localStorage.getItem("bo_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function EstadoBadge({ estado }) {
  const map = {
    APROBADO: "bg-green-100 text-green-700",
    OBSERVADO: "bg-yellow-100 text-yellow-700",
    SUBIDO: "bg-blue-100 text-blue-600",
  };
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
        map[estado] || "bg-neutral-100 text-neutral-500"
      }`}
    >
      {estado}
    </span>
  );
}

function fileIcon(mime) {
  if (!mime) return "📄";
  if (mime.includes("pdf")) return "📕";
  if (mime.includes("image")) return "🖼️";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  return "📄";
}

async function descargarDocumento(doc) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) {
      alert("No se pudo descargar el archivo");
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.nombre_original;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("Error al descargar el archivo");
  }
}

// ─── Visor de documento (modal) ───────────────────────────────────────────────
function DocViewer({ doc, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blobUrl, setBlobUrl] = useState(null);

  const isPdf = doc.mime_type?.includes("pdf");
  const isImage = doc.mime_type?.includes("image");
  const canPreview = isPdf || isImage;

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    async function load() {
      const token = localStorage.getItem("bo_token");
      try {
        const r = await fetch(
          `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;
        if (!r.ok) { setError("No se pudo cargar el archivo."); setLoading(false); return; }
        const blob = await r.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setError("Error al cargar el archivo.");
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id_documento]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Modal pequeño: para tipos no previsualizable o error
  if (!canPreview || error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-5xl mb-4">{fileIcon(doc.mime_type)}</div>
          <p className="text-sm font-medium text-neutral-800 mb-1 truncate px-2">
            {doc.nombre_original}
          </p>
          <p className="text-xs text-neutral-400 mb-6">
            {formatBytes(doc.tamano_bytes)} · {formatDate(doc.fecha_subida)}
          </p>
          {loading && <p className="text-sm text-neutral-500 mb-4">Cargando…</p>}
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {!loading && !error && (
            <>
              <p className="text-xs text-neutral-500 mb-5">
                Este tipo de archivo no se puede previsualizar en el navegador.
                Ábrelo con la aplicación correspondiente instalada en tu equipo.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => blobUrl && window.open(blobUrl, "_blank")}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Abrir con aplicación ↗
                </button>
                <button
                  onClick={() => { descargarDocumento(doc); onClose(); }}
                  className="text-sm px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50"
                >
                  Descargar
                </button>
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="mt-5 text-xs text-neutral-400 hover:text-neutral-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Modal grande: PDF e imágenes
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-full h-full"
        style={{ maxWidth: "1300px", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del visor */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <span className="text-base leading-none">{fileIcon(doc.mime_type)}</span>
          <span className="flex-1 text-sm font-medium text-neutral-800 truncate">
            {doc.nombre_original}
          </span>
          <span className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">
            {formatBytes(doc.tamano_bytes)}
          </span>
          {blobUrl && isPdf && (
            <button
              onClick={() => window.open(blobUrl, "_blank")}
              className="text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0"
            >
              Nueva ventana ↗
            </button>
          )}
          <button
            onClick={() => descargarDocumento(doc)}
            className="text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0"
          >
            Descargar
          </button>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {/* Área del visor */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-neutral-300">
          {loading && (
            <div className="text-sm text-neutral-600 bg-white px-5 py-3 rounded-lg shadow">
              Cargando archivo…
            </div>
          )}
          {!loading && !error && blobUrl && isPdf && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0"
              title={doc.nombre_original}
            />
          )}
          {!loading && !error && blobUrl && isImage && (
            <img
              src={blobUrl}
              alt={doc.nombre_original}
              className="max-w-full max-h-full object-contain p-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fila de documento ────────────────────────────────────────────────────────
function DocRow({ doc, isAdmin, onEliminar }) {
  const [eliminando, setEliminando] = useState(false);
  const [verDoc, setVerDoc] = useState(false);

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${doc.nombre_original}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    const r = await boDELETE(`/backoffice/documentos/${doc.id_documento}`);
    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar");
      setEliminando(false);
      return;
    }
    onEliminar(doc.id_documento);
  }

  return (
    <>
      <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-neutral-50 rounded-lg group">
        <span className="text-base leading-none">{fileIcon(doc.mime_type)}</span>
        <span className="flex-1 text-xs text-neutral-800 truncate min-w-0">
          {doc.nombre_original}
        </span>
        <EstadoBadge estado={doc.estado_revision} />
        <span className="text-[11px] text-neutral-400 shrink-0">
          {formatBytes(doc.tamano_bytes)}
        </span>
        <span className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">
          {formatDate(doc.fecha_subida)}
        </span>
        <button
          onClick={() => setVerDoc(true)}
          className="text-[11px] px-2 py-0.5 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 shrink-0"
        >
          Abrir
        </button>
        <button
          onClick={() => descargarDocumento(doc)}
          className="text-[11px] px-2 py-0.5 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0"
        >
          Descargar
        </button>
        {isAdmin && (
          <button
            onClick={handleEliminar}
            disabled={eliminando}
            className="text-[11px] px-2 py-0.5 rounded border border-red-300 text-red-600 hover:bg-red-50 shrink-0 disabled:opacity-50"
          >
            {eliminando ? "…" : "Eliminar"}
          </button>
        )}
      </div>
      {verDoc && <DocViewer doc={doc} onClose={() => setVerDoc(false)} />}
    </>
  );
}

// ─── Nodo del árbol (colapsable) ──────────────────────────────────────────────
function TreeNode({ icon, label, sublabel, count, defaultOpen = false, forceOpen, headerExtra, children }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen !== undefined) setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <div>
      {/* div en vez de button para poder anidar botones reales (headerExtra) */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-neutral-100 rounded-lg cursor-pointer select-none"
      >
        <span className="text-neutral-400 text-xs w-3 shrink-0">{open ? "▾" : "▸"}</span>
        <span className="text-base leading-none shrink-0">{icon}</span>
        {/* headerExtra entre el ícono y el nombre; stopPropagation evita toggle */}
        {headerExtra && (
          <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {headerExtra}
          </span>
        )}
        <span className="text-sm font-medium text-neutral-800 flex-1 truncate min-w-0">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-neutral-400 hidden sm:block shrink-0">
            {sublabel}
          </span>
        )}
        {count !== undefined && (
          <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-full shrink-0">
            {count}
          </span>
        )}
      </div>
      {open && <div className="ml-5 border-l border-neutral-200 pl-2 mt-0.5">{children}</div>}
    </div>
  );
}

// ─── Sección de items de un ítem de checklist ────────────────────────────────
function ItemNode({ item, isAdmin, onEliminar, forceOpen }) {
  const [docs, setDocs] = useState(item.documentos);

  function handleEliminar(id) {
    setDocs((prev) => prev.filter((d) => d.id_documento !== id));
    onEliminar(id);
  }

  if (docs.length === 0) return null;

  return (
    <TreeNode icon="📂" label={item.nombre} count={docs.length} forceOpen={forceOpen}>
      <div className="mt-1 space-y-0.5">
        {docs.map((doc) => (
          <DocRow
            key={doc.id_documento}
            doc={doc}
            isAdmin={isAdmin}
            onEliminar={handleEliminar}
          />
        ))}
      </div>
    </TreeNode>
  );
}

// ─── Sección de solicitud ────────────────────────────────────────────────────
function SolicitudNode({ solicitud, isAdmin, onEliminar, forceOpen }) {
  const totalDocs = solicitud.items.reduce((acc, it) => acc + it.documentos.length, 0);
  if (totalDocs === 0) return null;

  return (
    <TreeNode icon="📋" label={solicitud.titulo} count={totalDocs} forceOpen={forceOpen}>
      {solicitud.items.map((item, i) => (
        <ItemNode key={i} item={item} isAdmin={isAdmin} onEliminar={onEliminar} forceOpen={forceOpen} />
      ))}
    </TreeNode>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DocumentosBackoffice() {
  const [clientes, setClientes] = useState([]);
  const [internos, setInternos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [expandedMap, setExpandedMap] = useState({});

  function toggleExpand(id) {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const usuario = getUser();
  const isAdmin = usuario?.rol === "admin";

  useEffect(() => {
    cargar();
  }, []);

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

  // Eliminar un documento del árbol local (sin recargar todo)
  function handleEliminarGlobal(idDocumento) {
    function filtrarDocs(lista) {
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
    setClientes((prev) => filtrarDocs(prev));
    setInternos((prev) => filtrarDocs(prev));
  }

  // Filtrar árbol por búsqueda (nombre cliente, solicitud o archivo)
  const q = busqueda.toLowerCase().trim();

  function filtrarClientes(lista) {
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

  const clientesFiltrados = filtrarClientes(clientes);
  const internosFiltrados = filtrarClientes(internos);

  const totalDocs =
    clientes.reduce(
      (a, c) =>
        a + c.solicitudes.reduce((b, s) => b + s.items.reduce((c2, it) => c2 + it.documentos.length, 0), 0),
      0
    ) +
    internos.reduce(
      (a, u) =>
        a + u.solicitudes.reduce((b, s) => b + s.items.reduce((c2, it) => c2 + it.documentos.length, 0), 0),
      0
    );

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Documentos</h1>
          <p className="text-sm text-neutral-500">
            {loading ? "Cargando…" : `${totalDocs} documento${totalDocs !== 1 ? "s" : ""} en total`}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, cliente, solicitud…"
            className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-64"
          />
          <button
            onClick={cargar}
            className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50"
          >
            ↻
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-neutral-400 text-sm">Cargando documentos…</div>
      )}

      {!loading && !error && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm divide-y divide-neutral-100">
          {/* Sección Clientes */}
          <div className="p-3">
            <TreeNode
              icon="👥"
              label="Documentos de clientes"
              count={clientesFiltrados.reduce(
                (a, c) =>
                  a + c.solicitudes.reduce((b, s) => b + s.items.reduce((c2, it) => c2 + it.documentos.length, 0), 0),
                0
              )}
              defaultOpen
            >
              {clientesFiltrados.length === 0 && (
                <p className="text-xs text-neutral-400 py-2 px-2">Sin resultados.</p>
              )}
              {clientesFiltrados.map((cliente) => (
                <TreeNode
                  key={cliente.id_cliente}
                  icon="👤"
                  label={cliente.nombre}
                  sublabel={cliente.email}
                  count={cliente.solicitudes.reduce(
                    (a, s) => a + s.items.reduce((b, it) => b + it.documentos.length, 0),
                    0
                  )}
                  forceOpen={expandedMap[cliente.id_cliente]}
                  headerExtra={
                    <button
                      onClick={() => toggleExpand(cliente.id_cliente)}
                      title={expandedMap[cliente.id_cliente] ? "Contraer todo" : "Expandir todo"}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors shrink-0 leading-none ${
                        expandedMap[cliente.id_cliente]
                          ? "border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100"
                          : "border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                      }`}
                    >
                      {expandedMap[cliente.id_cliente] ? "−" : "+"}
                    </button>
                  }
                >
                  {cliente.solicitudes.map((sol) => (
                    <SolicitudNode
                      key={sol.id_solicitud}
                      solicitud={sol}
                      isAdmin={isAdmin}
                      onEliminar={handleEliminarGlobal}
                      forceOpen={expandedMap[cliente.id_cliente]}
                    />
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          </div>

          {/* Sección Internos */}
          {internosFiltrados.length > 0 && (
            <div className="p-3">
              <TreeNode
                icon="🏢"
                label="Documentos subidos por el equipo"
                count={internosFiltrados.reduce(
                  (a, u) =>
                    a + u.solicitudes.reduce((b, s) => b + s.items.reduce((c2, it) => c2 + it.documentos.length, 0), 0),
                  0
                )}
              >
                {internosFiltrados.map((usuario) => (
                  <TreeNode
                    key={usuario.id_usuario}
                    icon="👤"
                    label={usuario.nombre}
                    sublabel={usuario.rol ? `${usuario.rol} · ${usuario.email || ""}` : usuario.email}
                    count={usuario.solicitudes.reduce(
                      (a, s) => a + s.items.reduce((b, it) => b + it.documentos.length, 0),
                      0
                    )}
                    forceOpen={expandedMap[usuario.id_usuario]}
                    headerExtra={
                      <button
                        onClick={() => toggleExpand(usuario.id_usuario)}
                        title={expandedMap[usuario.id_usuario] ? "Contraer todo" : "Expandir todo"}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors shrink-0 leading-none ${
                          expandedMap[usuario.id_usuario]
                            ? "border-amber-400 text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "border-indigo-400 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                        }`}
                      >
                        {expandedMap[usuario.id_usuario] ? "−" : "+"}
                      </button>
                    }
                  >
                    {usuario.solicitudes.map((sol) => (
                      <SolicitudNode
                        key={sol.id_solicitud}
                        solicitud={sol}
                        isAdmin={isAdmin}
                        onEliminar={handleEliminarGlobal}
                        forceOpen={expandedMap[usuario.id_usuario]}
                      />
                    ))}
                  </TreeNode>
                ))}
              </TreeNode>
            </div>
          )}

          {!loading && totalDocs === 0 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">
              No hay documentos subidos aún.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
