// src/pages/backoffice/media/MediaPanel.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boDELETE } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function formatBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function AssetCard({ a, onCopiar, onEliminar }) {
  const [copied, setCopied] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(a.url_publica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopiar?.(a);
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-primary/40 transition-colors group">
      {/* Imagen */}
      <div className="relative h-36 bg-neutral-100 flex items-center justify-center overflow-hidden">
        <img src={a.url_publica} alt={a.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {/* Overlay acciones */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={copiar}
            className="p-2 bg-white rounded-full shadow text-primary hover:bg-primary hover:text-white transition-colors"
            title="Copiar URL">
            {copied
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            }
          </button>
          <button onClick={() => onEliminar(a)}
            className="p-2 bg-white rounded-full shadow text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            title="Eliminar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-medium text-neutral-800 truncate" title={a.nombre}>{a.nombre}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">{formatBytes(a.tamano_bytes)}</p>
        <button onClick={copiar}
          className={`mt-2 w-full text-xs py-1.5 rounded-lg border transition-colors ${copied ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-neutral-200 text-neutral-600 hover:border-primary/50 hover:text-primary"}`}>
          {copied ? "✓ URL copiada" : "Copiar URL"}
        </button>
      </div>
    </div>
  );
}

export default function MediaPanel() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [nombreCustom, setNombreCustom] = useState("");
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => { cargar(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/media");
    if (r.ok) setAssets(r.assets || []);
    setLoading(false);
  }

  async function subirArchivo(file) {
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem("bo_token");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("nombre", nombreCustom.trim() || file.name);

    try {
      const res = await fetch(`${API_URL}/backoffice/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.ok) {
        setAssets((prev) => [data.asset, ...prev]);
        setNombreCustom("");
        setToast({ tipo: "ok", msg: "Imagen subida correctamente." });
      } else {
        setToast({ tipo: "error", msg: data.msg || "Error subiendo imagen" });
      }
    } catch (e) {
      setToast({ tipo: "error", msg: "Error de conexión al subir" });
    }
    setUploading(false);
  }

  function onFileInput(e) {
    const file = e.target.files?.[0];
    if (file) subirArchivo(file);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) subirArchivo(file);
  }

  async function eliminar(a) {
    if (!confirm(`¿Eliminar la imagen "${a.nombre}"?`)) return;
    const r = await boDELETE(`/backoffice/media/${a.id_asset}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    setAssets((prev) => prev.filter((x) => x.id_asset !== a.id_asset));
    setToast({ tipo: "ok", msg: "Imagen eliminada." });
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Media</h1>
        <p className="text-sm text-neutral-500">Imágenes para correos electrónicos — almacenadas en Google Cloud Storage.</p>
      </div>

      {/* Upload zone */}
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-neutral-300 hover:border-primary/50 bg-neutral-50"}`}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-neutral-500">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-sm">Subiendo a Google Cloud Storage…</p>
          </div>
        ) : (
          <>
            <svg className="w-10 h-10 mx-auto mb-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            <p className="text-sm text-neutral-600 mb-1">
              <strong>Arrastra una imagen aquí</strong> o{" "}
              <button onClick={() => inputRef.current?.click()} className="text-primary underline hover:no-underline">
                selecciona un archivo
              </button>
            </p>
            <p className="text-xs text-neutral-400">PNG, JPG, WebP · máx. 10 MB</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="text"
                value={nombreCustom}
                onChange={(e) => setNombreCustom(e.target.value)}
                placeholder="Nombre opcional (ej: banner-bienvenida)"
                className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <button onClick={() => inputRef.current?.click()}
                className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:opacity-90">
                Subir imagen
              </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
          </>
        )}
      </div>

      {/* Info GCS */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-xs text-sky-700 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
        </svg>
        <span>
          Las imágenes se suben al bucket <strong>inspira-legal-docs</strong> en Google Cloud Storage con acceso público.
          Copia la URL de cualquier imagen y pégala en el HTML del template de correo.
        </span>
      </div>

      {/* Grid de imágenes */}
      {loading && <p className="text-sm text-neutral-400 text-center py-8">Cargando imágenes…</p>}
      {!loading && assets.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
          </svg>
          <p className="text-sm">No hay imágenes subidas aún.</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {assets.map((a) => (
          <AssetCard key={a.id_asset} a={a}
            onCopiar={() => setToast({ tipo: "ok", msg: "URL copiada al portapapeles." })}
            onEliminar={eliminar} />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${toast.tipo === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
