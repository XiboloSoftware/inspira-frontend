// SeccionUniversidades.jsx — CRUD Universidades
import { useMemo, useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { formatPrecio, activoBadge, listaBadge, LISTAS_INSPIRA, MODAL_OVERLAY, MODAL_PANEL } from "./catalogoConstants";

const FORM_INIT = {
  id_comunidad: "", sigla: "", nombre_completo: "", ciudad: "",
  lista_inspira: "LISTA_2", url_masteres: "", notas_latam: "", activo: true,
};

// ── Th sorteable ──────────────────────────────────────────────────────────────
function Th({ col, label, sortCol, sortDir, onSort, right, center }) {
  const active = sortCol === col;
  const align = right ? "text-right" : center ? "text-center" : "text-left";
  return (
    <th onClick={() => onSort(col)}
      className={`px-4 py-3 cursor-pointer select-none whitespace-nowrap hover:bg-neutral-100 transition ${align}`}>
      <span className={`inline-flex items-center gap-1 ${right ? "justify-end" : center ? "justify-center" : ""}`}>
        {label}
        <span className="text-[10px] text-neutral-400">{active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
      </span>
    </th>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ item, comunidades, onClose, onSaved }) {
  const isEdit = !!item?.id_universidad;
  const [form, setForm] = useState(
    isEdit
      ? {
          id_comunidad:    String(item.id_comunidad),
          sigla:           item.sigla           || "",
          nombre_completo: item.nombre_completo || "",
          ciudad:          item.ciudad          || "",
          lista_inspira:   item.lista_inspira   || "LISTA_2",
          url_masteres:    item.url_masteres    || "",
          notas_latam:     item.notas_latam     || "",
          activo:          item.activo,
        }
      : { ...FORM_INIT }
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const comunidadSel = comunidades.find((c) => String(c.id_comunidad) === String(form.id_comunidad));

  async function submit(e) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/universidades/${item.id_universidad}`
        : "/backoffice/catalogo/universidades";
      const data = await boPOST(url, {
        id_comunidad: form.id_comunidad, sigla: form.sigla,
        nombre_completo: form.nombre_completo, ciudad: form.ciudad,
        lista_inspira: form.lista_inspira, url_masteres: form.url_masteres || null,
        notas_latam: form.notas_latam || null, activo: form.activo,
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
          <h2 className="text-lg font-bold text-primary">{isEdit ? "Editar Universidad" : "Nueva Universidad"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              Comunidad Autónoma *
              {isEdit && <span className="ml-1 font-normal text-amber-600">— cambiar recalcula precios de todos sus másteres</span>}
            </label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.id_comunidad} onChange={(e) => set("id_comunidad", e.target.value)}>
              <option value="">Seleccionar…</option>
              {comunidades.map((c) => (
                <option key={c.id_comunidad} value={c.id_comunidad}>
                  {c.nombre} — {formatPrecio(c.precio_credito_extranjero)}/crédito
                </option>
              ))}
            </select>
            {comunidadSel && (
              <p className="mt-1 text-xs text-neutral-500">
                €/crédito heredado: <span className="font-semibold text-neutral-700">{formatPrecio(comunidadSel.precio_credito_extranjero)}</span>
                {" → 60 ECTS = "}
                <span className="font-semibold text-neutral-700">{formatPrecio(Number(comunidadSel.precio_credito_extranjero) * 60)}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Sigla *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.sigla} onChange={(e) => set("sigla", e.target.value.toUpperCase())} placeholder="Ej: UAM" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Ciudad *</label>
              <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Ej: Madrid" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre completo *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_completo} onChange={(e) => set("nombre_completo", e.target.value)}
              placeholder="Ej: Universidad Autónoma de Madrid" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Lista Inspira *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.lista_inspira} onChange={(e) => set("lista_inspira", e.target.value)}>
              {LISTAS_INSPIRA.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">URL catálogo másteres</label>
            <input type="url" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.url_masteres} onChange={(e) => set("url_masteres", e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Notas para LATAM</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.notas_latam} onChange={(e) => set("notas_latam", e.target.value)}
              placeholder="Tips o requisitos especiales para estudiantes latinoamericanos" />
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
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear universidad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla principal ───────────────────────────────────────────────────────────
export default function SeccionUniversidades({ universidades, comunidades, onReload }) {
  const [modal,    setModal]    = useState(null);
  const [toggling, setToggling] = useState(null);
  const [search,   setSearch]   = useState("");
  const [filtroCC, setFiltroCC] = useState("");
  const [sortCol,  setSortCol]  = useState("nombre_completo");
  const [sortDir,  setSortDir]  = useState("asc");

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return universidades.filter((u) => {
      if (filtroCC && String(u.id_comunidad) !== filtroCC) return false;
      if (q && !u.sigla.toLowerCase().includes(q) && !u.nombre_completo.toLowerCase().includes(q) && !u.ciudad.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [universidades, filtroCC, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (sortCol === "masters") { valA = a._count?.masters ?? 0; valB = b._count?.masters ?? 0; }
      else if (sortCol === "precio") {
        valA = Number(a.comunidad?.precio_credito_extranjero ?? 0);
        valB = Number(b.comunidad?.precio_credito_extranjero ?? 0);
      } else if (sortCol === "comunidad") {
        valA = a.comunidad?.nombre ?? ""; valB = b.comunidad?.nombre ?? "";
      } else { valA = String(a[sortCol] ?? ""); valB = String(b[sortCol] ?? ""); }
      const cmp = typeof valA === "number" ? valA - valB : valA.localeCompare(valB, "es");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const thProps = { sortCol, sortDir, onSort: toggleSort };

  async function toggleEstado(u) {
    setToggling(u.id_universidad);
    try { await boPOST(`/backoffice/catalogo/universidades/${u.id_universidad}/estado`, { activo: !u.activo }); onReload(); }
    finally { setToggling(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Universidades</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Cada universidad pertenece a una CCAA y hereda su precio €/crédito</p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
          <span className="text-lg leading-none">+</span> Nueva universidad
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar sigla, nombre, ciudad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroCC} onChange={(e) => setFiltroCC(e.target.value)}>
          <option value="">Todas las CCAA ({universidades.length})</option>
          {comunidades.map((c) => {
            const n = universidades.filter((u) => u.id_comunidad === c.id_comunidad).length;
            return <option key={c.id_comunidad} value={c.id_comunidad}>{c.nombre} ({n})</option>;
          })}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
            <tr>
              <Th col="sigla"           label="Sigla"       {...thProps} />
              <Th col="nombre_completo" label="Universidad" {...thProps} />
              <Th col="ciudad"          label="Ciudad"      {...thProps} />
              <Th col="comunidad"       label="CCAA"        {...thProps} />
              <Th col="precio"          label="€/crédito"   {...thProps} right />
              <Th col="lista_inspira"   label="Lista"       {...thProps} center />
              <Th col="masters"         label="Másteres"    {...thProps} center />
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.length === 0 && (
              <tr><td colSpan={9} className="text-center py-10 text-neutral-400">Sin universidades</td></tr>
            )}
            {sorted.map((u) => {
              const badge  = activoBadge(u.activo);
              const lbadge = listaBadge(u.lista_inspira);
              return (
                <tr key={u.id_universidad} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-neutral-700 whitespace-nowrap">{u.sigla}</td>
                  <td className="px-4 py-3 text-neutral-800 max-w-[200px] truncate" title={u.nombre_completo}>{u.nombre_completo}</td>
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{u.ciudad}</td>
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{u.comunidad?.nombre || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                    {u.comunidad ? formatPrecio(u.comunidad.precio_credito_extranjero) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${lbadge.cls}`}>{lbadge.label}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-neutral-600">{u._count?.masters ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal({ item: u })} className="text-xs text-primary hover:underline">Editar</button>
                      <button disabled={toggling === u.id_universidad} onClick={() => toggleEstado(u)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40">
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && <Modal item={modal.item} comunidades={comunidades} onClose={() => setModal(null)} onSaved={() => { setModal(null); onReload(); }} />}
    </div>
  );
}
