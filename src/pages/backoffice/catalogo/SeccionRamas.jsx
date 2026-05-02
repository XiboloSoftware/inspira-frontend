// SeccionRamas.jsx — CRUD Ramas de Conocimiento
// Las ramas predefinidas aquí aparecen como opciones al crear/editar un máster.
import { useMemo, useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { activoBadge, MODAL_OVERLAY, MODAL_PANEL } from "./catalogoConstants";

function Th({ col, label, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  return (
    <th onClick={() => onSort(col)}
      className="px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:bg-neutral-100 transition text-left">
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-[10px] text-neutral-400">{active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </span>
    </th>
  );
}

function Modal({ item, onClose, onSaved }) {
  const isEdit = !!item?.id_rama;
  const [etiqueta, setEtiqueta] = useState(item?.etiqueta || "");
  const [valor,    setValor]    = useState(item?.valor    || "");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState(null);

  // Auto-generar el valor (código) desde la etiqueta al crear
  function handleEtiquetaChange(v) {
    setEtiqueta(v);
    if (!isEdit) {
      setValor(
        v.trim()
          .toUpperCase()
          .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita tildes
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "")
      );
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/ramas/${item.id_rama}`
        : "/backoffice/catalogo/ramas";
      const body = isEdit ? { etiqueta } : { valor, etiqueta };
      const data = await boPOST(url, body);
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      onSaved();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  }

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-primary">{isEdit ? "Editar Rama" : "Nueva Rama"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              Nombre visible *
              <span className="ml-1 font-normal text-neutral-400">— lo que verá el usuario al seleccionar</span>
            </label>
            <input required autoFocus
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={etiqueta} onChange={(e) => handleEtiquetaChange(e.target.value)}
              placeholder="Ej: Ciencias Sociales y Jurídicas" />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Código interno *
                <span className="ml-1 font-normal text-neutral-400">— se genera solo, no editable después</span>
              </label>
              <input required
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={valor} onChange={(e) => setValor(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                placeholder="CIENCIAS_SOCIALES_JURIDICAS" />
              <p className="mt-1 text-xs text-neutral-400">Usa mayúsculas y guiones bajos. Es el valor guardado en la BD.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-neutral-50 transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear rama"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SeccionRamas({ ramas, onReload }) {
  const [modal,    setModal]    = useState(null);
  const [toggling, setToggling] = useState(null);
  const [search,   setSearch]   = useState("");
  const [sortCol,  setSortCol]  = useState("etiqueta");
  const [sortDir,  setSortDir]  = useState("asc");

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...ramas]
      .filter((r) => !q || r.etiqueta.toLowerCase().includes(q) || r.valor.toLowerCase().includes(q))
      .sort((a, b) => {
        const valA = String(a[sortCol] ?? ""); const valB = String(b[sortCol] ?? "");
        const cmp = valA.localeCompare(valB, "es");
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [ramas, search, sortCol, sortDir]);

  const thProps = { sortCol, sortDir, onSort: toggleSort };

  async function toggleEstado(r) {
    setToggling(r.id_rama);
    try { await boPOST(`/backoffice/catalogo/ramas/${r.id_rama}/estado`, { activo: !r.activo }); onReload(); }
    finally { setToggling(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Ramas de Conocimiento</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Las ramas activas aparecen como opciones al crear o editar un máster
          </p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
          <span className="text-lg leading-none">+</span> Nueva rama
        </button>
      </div>

      <div className="mb-3">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar rama…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
            <tr>
              <Th col="etiqueta" label="Nombre visible" {...thProps} />
              <Th col="valor"    label="Código interno" {...thProps} />
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-neutral-400">Sin ramas</td></tr>
            )}
            {filtered.map((r) => {
              const badge = activoBadge(r.activo);
              return (
                <tr key={r.id_rama} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-800">{r.etiqueta}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 bg-neutral-50/50">{r.valor}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal({ item: r })} className="text-xs text-primary hover:underline">Editar</button>
                      <button disabled={toggling === r.id_rama} onClick={() => toggleEstado(r)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40">
                        {r.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && <Modal item={modal.item} onClose={() => setModal(null)} onSaved={() => { setModal(null); onReload(); }} />}
    </div>
  );
}
