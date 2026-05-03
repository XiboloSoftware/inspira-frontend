// SeccionComunidades.jsx — CRUD Comunidades Autónomas
import { useMemo, useState } from "react";
import { boPOST, boDELETE } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { formatPrecio, activoBadge, MODAL_OVERLAY, MODAL_PANEL } from "./catalogoConstants";

const FORM_INIT = {
  nombre: "", precio_credito_extranjero: "", sistema_postulacion: "", notas: "", activo: true,
};

// ── Th sorteable ──────────────────────────────────────────────────────────────
function Th({ col, label, sortCol, sortDir, onSort, right }) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:bg-neutral-100 transition ${right ? "text-right" : "text-left"}`}
    >
      <span className={`inline-flex items-center gap-1 ${right ? "justify-end" : ""}`}>
        {label}
        <span className="text-[10px] text-neutral-400">{active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </span>
    </th>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ item, onClose, onSaved }) {
  const isEdit = !!item?.id_comunidad;
  const [form, setForm] = useState(
    isEdit
      ? {
          nombre:                    item.nombre               || "",
          precio_credito_extranjero: String(Number(item.precio_credito_extranjero)),
          sistema_postulacion:       item.sistema_postulacion  || "",
          notas:                     item.notas                || "",
          activo:                    item.activo,
        }
      : { ...FORM_INIT }
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const precioEst = form.precio_credito_extranjero
    ? Number(form.precio_credito_extranjero) * 60
    : null;

  async function submit(e) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/comunidades/${item.id_comunidad}`
        : "/backoffice/catalogo/comunidades";
      const data = await boPOST(url, {
        nombre: form.nombre,
        precio_credito_extranjero: form.precio_credito_extranjero,
        sistema_postulacion: form.sistema_postulacion || null,
        notas: form.notas || null,
        activo: form.activo,
      });
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      onSaved();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  }

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL_PANEL}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-primary">{isEdit ? "Editar Comunidad" : "Nueva Comunidad Autónoma"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Andalucía" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              Precio €/crédito (extranjero) *
              <span className="ml-1 font-normal text-neutral-400">— base de todos los másteres de esta CCAA</span>
            </label>
            <input required type="number" step="0.01" min="0"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.precio_credito_extranjero} onChange={(e) => set("precio_credito_extranjero", e.target.value)}
              placeholder="Ej: 21.17" />
            {precioEst != null && (
              <p className="mt-1 text-xs text-neutral-500">
                Estimado 60 ECTS: <span className="font-semibold text-neutral-700">{formatPrecio(precioEst)}</span>
                <span className="ml-1 text-neutral-400">— al guardar recalcula todos los másteres de esta CCAA</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Sistema de postulación</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.sistema_postulacion} onChange={(e) => set("sistema_postulacion", e.target.value)}
              placeholder="Ej: DUA, independiente, rolling" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Notas internas</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
            Activa
          </label>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-neutral-50 transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear comunidad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla principal ───────────────────────────────────────────────────────────
export default function SeccionComunidades({ comunidades, onReload }) {
  const [modal,    setModal]    = useState(null);
  const [toggling, setToggling] = useState(null);
  const [purging,  setPurging]  = useState(null);
  const [search,   setSearch]   = useState("");
  const [sortCol,  setSortCol]  = useState("nombre");
  const [sortDir,  setSortDir]  = useState("asc");

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const base = q
      ? comunidades.filter((c) => c.nombre.toLowerCase().includes(q) || (c.sistema_postulacion || "").toLowerCase().includes(q))
      : comunidades;
    return [...base].sort((a, b) => {
      let valA, valB;
      if (sortCol === "universidades") { valA = a._count?.universidades ?? 0; valB = b._count?.universidades ?? 0; }
      else if (sortCol === "precio_credito_extranjero" || sortCol === "precio_estimado_60ects") {
        valA = Number(a[sortCol] ?? 0); valB = Number(b[sortCol] ?? 0);
      } else { valA = String(a[sortCol] ?? ""); valB = String(b[sortCol] ?? ""); }
      const cmp = typeof valA === "number" ? valA - valB : valA.localeCompare(valB, "es");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [comunidades, search, sortCol, sortDir]);

  const thProps = { sortCol, sortDir, onSort: toggleSort };

  async function toggleEstado(c) {
    setToggling(c.id_comunidad);
    try { await boPOST(`/backoffice/catalogo/comunidades/${c.id_comunidad}/estado`, { activo: !c.activo }); onReload(); }
    finally { setToggling(null); }
  }

  async function purgarComunidad(c) {
    if (!await dialog.confirm(`¿Eliminar permanentemente "${c.nombre}"? Esta acción no se puede deshacer.`)) return;
    setPurging(c.id_comunidad);
    try {
      const data = await boDELETE(`/backoffice/catalogo/comunidades/${c.id_comunidad}`);
      if (!data.ok) { dialog.toast(data.msg || "Error al eliminar", "error"); return; }
      onReload();
    } finally { setPurging(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Comunidades Autónomas</h2>
          <p className="text-xs text-neutral-500 mt-0.5">El precio €/crédito se fija aquí y se hereda por todas las universidades y másteres de cada CCAA</p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
          <span className="text-lg leading-none">+</span> Nueva comunidad
        </button>
      </div>

      <div className="mb-3">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar comunidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
            <tr>
              <Th col="nombre"                    label="Comunidad"      {...thProps} />
              <Th col="precio_credito_extranjero" label="€/crédito"      {...thProps} right />
              <Th col="precio_estimado_60ects"    label="Est. 60 ECTS"   {...thProps} right />
              <th className="text-left px-4 py-3">Postulación</th>
              <Th col="universidades"             label="Universidades"  {...thProps} />
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-neutral-400">Sin comunidades registradas</td></tr>
            )}
            {sorted.map((c) => {
              const badge = activoBadge(c.activo);
              return (
                <tr key={c.id_comunidad} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-800">{c.nombre}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">{formatPrecio(c.precio_credito_extranjero)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{formatPrecio(c.precio_estimado_60ects)}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.sistema_postulacion || "—"}</td>
                  <td className="px-4 py-3 text-center text-neutral-600">{c._count?.universidades ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal({ item: c })} className="text-xs text-primary hover:underline">Editar</button>
                      <button disabled={toggling === c.id_comunidad} onClick={() => toggleEstado(c)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40">
                        {c.activo ? "Desactivar" : "Activar"}
                      </button>
                      {!c.activo && (
                        <button
                          disabled={purging === c.id_comunidad}
                          onClick={() => purgarComunidad(c)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                          title="Purgar (eliminar permanentemente)">
                          {purging === c.id_comunidad ? "…" : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                            </svg>
                          )}
                        </button>
                      )}
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
