// Árbol de documentos: EstadoBadge, DocRow, TreeNode, ItemNode, SolicitudNode
import { useEffect, useState } from "react";
import { boDELETE } from "../../../services/backofficeApi";
import DocViewer from "./DocViewer";
import { fileIcon, formatBytes, formatDate, descargarDocumento } from "./documentosUtils";

export function EstadoBadge({ estado }) {
  const map = {
    APROBADO: "bg-green-100 text-green-700",
    OBSERVADO: "bg-yellow-100 text-yellow-700",
    SUBIDO: "bg-blue-100 text-blue-600",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${map[estado] || "bg-neutral-100 text-neutral-500"}`}>
      {estado}
    </span>
  );
}

export function DocRow({ doc, isAdmin, onEliminar }) {
  const [eliminando, setEliminando] = useState(false);
  const [verDoc, setVerDoc] = useState(false);

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${doc.nombre_original}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    const r = await boDELETE(`/backoffice/documentos/${doc.id_documento}`);
    if (!r.ok) { alert(r.msg || "No se pudo eliminar"); setEliminando(false); return; }
    onEliminar(doc.id_documento);
  }

  return (
    <>
      <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-neutral-50 rounded-lg group">
        <span className="text-base leading-none">{fileIcon(doc.mime_type)}</span>
        <span className="flex-1 text-xs text-neutral-800 truncate min-w-0">{doc.nombre_original}</span>
        <EstadoBadge estado={doc.estado_revision} />
        <span className="text-[11px] text-neutral-400 shrink-0">{formatBytes(doc.tamano_bytes)}</span>
        <span className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">{formatDate(doc.fecha_subida)}</span>
        <button onClick={() => setVerDoc(true)} className="text-[11px] px-2 py-0.5 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 shrink-0">
          Abrir
        </button>
        <button onClick={() => descargarDocumento(doc)} className="text-[11px] px-2 py-0.5 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0">
          Descargar
        </button>
        {isAdmin && (
          <button onClick={handleEliminar} disabled={eliminando} className="text-[11px] px-2 py-0.5 rounded border border-red-300 text-red-600 hover:bg-red-50 shrink-0 disabled:opacity-50">
            {eliminando ? "…" : "Eliminar"}
          </button>
        )}
      </div>
      {verDoc && <DocViewer doc={doc} onClose={() => setVerDoc(false)} />}
    </>
  );
}

export function TreeNode({ icon, label, sublabel, count, defaultOpen = false, forceOpen, headerExtra, children }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen !== undefined) setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <div>
      <div onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 py-1.5 px-2 hover:bg-neutral-100 rounded-lg cursor-pointer select-none">
        <span className="text-neutral-400 text-xs w-3 shrink-0">{open ? "▾" : "▸"}</span>
        <span className="text-base leading-none shrink-0">{icon}</span>
        {headerExtra && <span className="shrink-0" onClick={(e) => e.stopPropagation()}>{headerExtra}</span>}
        <span className="text-sm font-medium text-neutral-800 flex-1 truncate min-w-0">{label}</span>
        {sublabel && <span className="text-[11px] text-neutral-400 hidden sm:block shrink-0">{sublabel}</span>}
        {count !== undefined && (
          <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-full shrink-0">{count}</span>
        )}
      </div>
      {open && <div className="ml-5 border-l border-neutral-200 pl-2 mt-0.5">{children}</div>}
    </div>
  );
}

export function ItemNode({ item, isAdmin, onEliminar, forceOpen }) {
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
          <DocRow key={doc.id_documento} doc={doc} isAdmin={isAdmin} onEliminar={handleEliminar} />
        ))}
      </div>
    </TreeNode>
  );
}

export function SolicitudNode({ solicitud, isAdmin, onEliminar, forceOpen }) {
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
