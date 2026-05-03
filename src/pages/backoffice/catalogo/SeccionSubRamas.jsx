// SeccionSubRamas.jsx — CRUD Sub-áreas de conocimiento
import { useMemo, useState } from "react";
import { boPOST } from "../../../services/backofficeApi";
import { activoBadge, MODAL_OVERLAY } from "./catalogoConstants";

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

function Modal({ item, ramas, onClose, onSaved }) {
  const isEdit = !!item?.id_sub_area;
  const [rama,     setRama]     = useState(item?.rama     || "");
  const [etiqueta, setEtiqueta] = useState(item?.etiqueta || "");
  const [valor,    setValor]    = useState(item?.valor    || "");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState(null);

  function handleEtiquetaChange(v) {
    setEtiqueta(v);
    if (!isEdit) {
      const slug = v.trim()
        .toUpperCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      setValor(slug);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null); setSaving(true);
    try {
      const url  = isEdit
        ? `/backoffice/catalogo/subareas/${item.id_sub_area}`
        : "/backoffice/catalogo/subareas";
      const body = isEdit ? { etiqueta } : { rama, valor, etiqueta };
      const data = await boPOST(url, body);
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      onSaved();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  }

  const ramasActivas = ramas.filter(r => r.activo);

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-primary">{isEdit ? "Editar Sub-área" : "Nueva Sub-área"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

          {/* Rama padre */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              Rama de conocimiento *
            </label>
            {isEdit ? (
              <p className="text-sm font-medium text-neutral-700 bg-neutral-50 border rounded-lg px-3 py-2">
                {ramas.find(r => r.valor === item.rama)?.etiqueta || item.rama}
                <span className="ml-2 text-xs text-neutral-400">(no editable)</span>
              </p>
            ) : (
              <select
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={rama}
                onChange={e => setRama(e.target.value)}
              >
                <option value="">— Selecciona una rama —</option>
                {ramasActivas.map(r => (
                  <option key={r.valor} value={r.valor}>{r.etiqueta}</option>
                ))}
              </select>
            )}
          </div>

          {/* Nombre visible */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              Nombre visible *
              <span className="ml-1 font-normal text-neutral-400">— lo que verá el usuario</span>
            </label>
            <input required autoFocus
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={etiqueta} onChange={e => handleEtiquetaChange(e.target.value)}
              placeholder="Ej: Informática y Software" />
          </div>

          {/* Código interno (solo en creación) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                Código interno *
                <span className="ml-1 font-normal text-neutral-400">— se genera solo, no editable después</span>
              </label>
              <input required
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={valor} onChange={e => setValor(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                placeholder="INFORMATICA_SOFTWARE" />
              <p className="mt-1 text-xs text-neutral-400">Usa mayúsculas y guiones bajos. Debe ser único en la BD.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-neutral-50 transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear sub-área"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SeccionSubRamas({ subramas, ramas, onReload }) {
  const [modal,        setModal]       = useState(null);
  const [toggling,     setToggling]    = useState(null);
  const [search,       setSearch]      = useState("");
  const [filtroRama,   setFiltroRama]  = useState("");
  const [filtroEstado, setFiltroEstado]= useState("todos");
  const [sortCol,      setSortCol]     = useState("etiqueta");
  const [sortDir,      setSortDir]     = useState("asc");

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const ramaEtiqueta = useMemo(() => {
    const map = {};
    ramas.forEach(r => { map[r.valor] = r.etiqueta; });
    return map;
  }, [ramas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...subramas]
      .filter(s => {
        if (filtroEstado === "activo"   && !s.activo)  return false;
        if (filtroEstado === "inactivo" &&  s.activo)  return false;
        if (filtroRama && s.rama !== filtroRama)        return false;
        return !q || s.etiqueta.toLowerCase().includes(q) || s.valor.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortCol === "rama") {
          valA = ramaEtiqueta[a.rama] || a.rama;
          valB = ramaEtiqueta[b.rama] || b.rama;
        } else {
          valA = String(a[sortCol] ?? "");
          valB = String(b[sortCol] ?? "");
        }
        const cmp = valA.localeCompare(valB, "es");
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [subramas, search, filtroRama, filtroEstado, sortCol, sortDir, ramaEtiqueta]);

  const thProps = { sortCol, sortDir, onSort: toggleSort };

  async function toggleEstado(s) {
    setToggling(s.id_sub_area);
    try {
      await boPOST(`/backoffice/catalogo/subareas/${s.id_sub_area}/estado`, { activo: !s.activo });
      onReload();
    } finally { setToggling(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Sub-áreas de conocimiento</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Las sub-áreas activas aparecen como opción de refinamiento al seleccionar una rama
          </p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
          <span className="text-lg leading-none">+</span> Nueva sub-área
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <input
          className="border rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar sub-área…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroRama}
          onChange={e => setFiltroRama(e.target.value)}
        >
          <option value="">Todas las ramas</option>
          {ramas.map(r => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
        </select>

        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {[
            { value: "todos",    label: "Todos" },
            { value: "activo",   label: "Activo" },
            { value: "inactivo", label: "Inactivo" },
          ].map(opt => (
            <button key={opt.value} type="button"
              onClick={() => setFiltroEstado(opt.value)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filtroEstado === opt.value
                  ? "bg-white shadow text-neutral-800"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-400">{filtered.length} sub-área{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
            <tr>
              <Th col="etiqueta" label="Nombre visible"  {...thProps} />
              <Th col="valor"    label="Código interno"  {...thProps} />
              <Th col="rama"     label="Rama"            {...thProps} />
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-neutral-400">Sin sub-áreas</td></tr>
            )}
            {filtered.map(s => {
              const badge = activoBadge(s.activo);
              return (
                <tr key={s.id_sub_area} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-800">{s.etiqueta}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 bg-neutral-50/50">{s.valor}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {ramaEtiqueta[s.rama] || s.rama}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal({ item: s })} className="text-xs text-primary hover:underline">Editar</button>
                      <button disabled={toggling === s.id_sub_area} onClick={() => toggleEstado(s)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40">
                        {s.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          item={modal.item}
          ramas={ramas}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); onReload(); }}
        />
      )}
    </div>
  );
}
