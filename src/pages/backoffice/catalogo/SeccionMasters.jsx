// SeccionMasters.jsx — CRUD Másteres
// precio_total_estimado = ects × precio_credito_extranjero de la CCAA de la universidad.
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import {
  RAMAS, MODALIDADES, TIENE_PRACTICAS_OPCIONES,
  formatPrecio, duracionLabel, activoBadge,
  MODAL_OVERLAY, MODAL_PANEL,
} from "./catalogoConstants";

const FORM_INIT = {
  id_universidad: "", nombre_limpio: "", nombre_original: "",
  rama: "CIENCIAS_SOCIALES_JURIDICAS", modalidad: "PRESENCIAL", ects: "60",
  es_habilitante: false, tiene_practicas: "", es_interuniversitario: false, es_dual: false,
  titulo_acceso: "", notas: "", activo: true,
};

function nivelLabel(nivel) {
  const map = { B1: "B1", B2: "B2", C1: "C1", C2: "C2", NATIVO: "Nativo", NO_ESPECIFICADO: "No especificado" };
  return map[nivel] || nivel || "—";
}

function categoriaLabel(cat) {
  if (!cat) return "—";
  return cat.replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Th sorteable (server-side) ─────────────────────────────────────────────────
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


// ── Modal crear / editar ──────────────────────────────────────────────────────
function ModalMaster({ item, universidades, comunidades, ramas, onClose, onSaved }) {
  const isEdit = !!item?.id_master;
  const [form, setForm] = useState(
    isEdit
      ? {
          id_universidad:        String(item.id_universidad),
          nombre_limpio:         item.nombre_limpio        || "",
          nombre_original:       item.nombre_original      || "",
          rama:                  item.rama                 || "CIENCIAS_SOCIALES_JURIDICAS",
          modalidad:             item.modalidad            || "PRESENCIAL",
          ects:                  String(item.ects          || 60),
          es_habilitante:        !!item.es_habilitante,
          tiene_practicas:       item.tiene_practicas == null ? "" : String(item.tiene_practicas),
          es_interuniversitario: !!item.es_interuniversitario,
          es_dual:               !!item.es_dual,
          titulo_acceso:         item.titulo_acceso        || "",
          notas:                 item.notas                || "",
          activo:                item.activo,
        }
      : { ...FORM_INIT }
  );
  const [saving,         setSaving]         = useState(false);
  const [err,            setErr]            = useState(null);
  const [detalle,        setDetalle]        = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [showCriterios,  setShowCriterios]  = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const univSel = universidades.find((u) => String(u.id_universidad) === String(form.id_universidad));
  const comUniv = univSel ? comunidades.find((c) => c.id_comunidad === univSel.id_comunidad) : null;
  const precioPreview = comUniv && form.ects
    ? Number(comUniv.precio_credito_extranjero) * Number(form.ects)
    : null;

  useEffect(() => {
    if (!isEdit) return;
    setLoadingDetalle(true);
    boGET(`/backoffice/catalogo/masters/${item.id_master}`)
      .then((d) => { if (d.ok) setDetalle(d.master); })
      .finally(() => setLoadingDetalle(false));
  }, [item?.id_master, isEdit]); // eslint-disable-line

  async function submit(e) {
    e.preventDefault();
    if (!form.rama.trim()) { setErr("La rama es obligatoria"); return; }
    setErr(null); setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/masters/${item.id_master}`
        : "/backoffice/catalogo/masters";
      const data = await boPOST(url, {
        id_universidad: form.id_universidad, nombre_limpio: form.nombre_limpio,
        nombre_original: form.nombre_original || form.nombre_limpio,
        rama: form.rama, modalidad: form.modalidad, ects: form.ects,
        es_habilitante: form.es_habilitante,
        tiene_practicas: form.tiene_practicas === "" ? null : form.tiene_practicas,
        es_interuniversitario: form.es_interuniversitario, es_dual: form.es_dual,
        titulo_acceso: form.titulo_acceso || null, notas: form.notas || null,
        activo: form.activo,
      });
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      onSaved();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  }

  const criterios = detalle?.criterios || [];
  const idiomas   = detalle?.idiomas   || [];

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL_PANEL}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-primary">{isEdit ? "Editar Máster" : "Nuevo Máster"}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

          {/* Universidad */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Universidad *</label>
            <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.id_universidad} onChange={(e) => set("id_universidad", e.target.value)}>
              <option value="">Seleccionar…</option>
              {universidades.map((u) => (
                <option key={u.id_universidad} value={u.id_universidad}>{u.sigla} — {u.nombre_completo}</option>
              ))}
            </select>
            {comUniv && (
              <p className="mt-1 text-xs text-neutral-500">
                CCAA: {comUniv.nombre} — {formatPrecio(comUniv.precio_credito_extranjero)}/crédito
              </p>
            )}
          </div>

          {/* Nombre limpio */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre limpio *</label>
            <input required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_limpio} onChange={(e) => set("nombre_limpio", e.target.value)}
              placeholder="Sin sufijos como '(a distancia)' o '(Interuniversitario)'" />
          </div>

          {/* Nombre original */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre original</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_original} onChange={(e) => set("nombre_original", e.target.value)}
              placeholder="Tal cual aparece en la web de la universidad (opcional)" />
          </div>

          {/* Rama + Modalidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Rama *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.rama} onChange={(e) => set("rama", e.target.value)}>
                <option value="">Seleccionar…</option>
                {ramas.filter((r) => r.activo).map((r) => (
                  <option key={r.id_rama} value={r.valor}>{r.etiqueta}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Modalidad *</label>
              <select required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.modalidad} onChange={(e) => set("modalidad", e.target.value)}>
                {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* ECTS */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              ECTS * <span className="font-normal text-neutral-400">— precio = ECTS × €/crédito CCAA</span>
            </label>
            <input required type="number" min="1" max="300"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.ects} onChange={(e) => set("ects", e.target.value)} />
            {precioPreview != null && (
              <p className="mt-1 text-xs text-neutral-500">
                Precio estimado: <span className="font-semibold text-neutral-700">{formatPrecio(precioPreview)}</span>
                {" · Duración: "}
                <span className="font-semibold text-neutral-700">
                  {duracionLabel(Number(form.ects) <= 60 ? 1 : Number(form.ects) <= 90 ? 1.5 : 2)}
                </span>
              </p>
            )}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[["es_habilitante","Máster habilitante"],["es_interuniversitario","Interuniversitario"],["es_dual","Dual (empresa)"]].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
                {label}
              </label>
            ))}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Prácticas</label>
              <select className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.tiene_practicas} onChange={(e) => set("tiene_practicas", e.target.value)}>
                {TIENE_PRACTICAS_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Título de acceso</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.titulo_acceso} onChange={(e) => set("titulo_acceso", e.target.value)}
              placeholder="Carreras que dan acceso al máster" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Notas internas</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.notas} onChange={(e) => set("notas", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
            <input type="checkbox" checked={form.activo} onChange={(e) => set("activo", e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary" />
            Activo
          </label>

          {/* ── Criterios e idiomas (solo en edición) ── */}
          {isEdit && (
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <button type="button"
                onClick={() => setShowCriterios((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition text-sm font-semibold text-neutral-700">
                <span className="flex items-center gap-2">
                  Criterios de admisión e idiomas
                  {loadingDetalle
                    ? <span className="text-xs text-neutral-400 font-normal">Cargando…</span>
                    : <span className="text-xs bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-full font-normal">
                        {criterios.length} criterios · {idiomas.length} idiomas
                      </span>
                  }
                </span>
                <span className="text-neutral-400 text-xs">{showCriterios ? "▲" : "▼"}</span>
              </button>

              {showCriterios && (
                <div className="px-4 py-3 space-y-4">
                  {/* Criterios */}
                  {criterios.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Criterios de admisión</p>
                      <div className="divide-y divide-neutral-50">
                        {criterios.map((c, i) => (
                          <div key={c.id_criterio || i} className="flex items-start gap-2 py-1.5 text-xs">
                            <span className="shrink-0 font-semibold text-neutral-400 w-4 text-right tabular-nums">{c.orden ?? i + 1}.</span>
                            <span className="shrink-0 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                              {categoriaLabel(c.categoria)}
                            </span>
                            <span className="flex-1 text-neutral-700 leading-relaxed">{c.descripcion || "—"}</span>
                            {c.peso_porcentaje != null && (
                              <span className="shrink-0 font-bold text-neutral-500 tabular-nums whitespace-nowrap">{c.peso_porcentaje}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">Sin criterios de admisión registrados.</p>
                  )}

                  {/* Idiomas */}
                  {idiomas.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">Idiomas requeridos</p>
                      <div className="divide-y divide-neutral-50">
                        {idiomas.map((id, i) => (
                          <div key={id.id_idioma_req || i} className="flex items-center gap-2 py-1.5 text-xs flex-wrap">
                            <span className="font-semibold text-neutral-800">{id.idioma}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                              {nivelLabel(id.nivel_minimo)}
                            </span>
                            {id.es_obligatorio && (
                              <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-semibold">Obligatorio</span>
                            )}
                            {id.peso_porcentaje != null && (
                              <span className="text-neutral-500 tabular-nums">{id.peso_porcentaje}%</span>
                            )}
                            {id.detalle && <span className="text-neutral-400 italic">{id.detalle}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-neutral-50 transition">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear máster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla principal ───────────────────────────────────────────────────────────
export default function SeccionMasters({ universidades, comunidades, ramas }) {
  const [masters,    setMasters]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null);
  const [toggling,   setToggling]   = useState(null);

  // Filtros
  const [search,       setSearch]       = useState("");
  const [filtroCC,     setFiltroCC]     = useState("");
  const [filtroUniv,   setFiltroUniv]   = useState("");
  const [filtroRama,   setFiltroRama]   = useState("");
  const [filtroMod,    setFiltroMod]    = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");
  // Ordenamiento (server-side)
  const [sortCol, setSortCol] = useState("nombre_limpio");
  const [sortDir, setSortDir] = useState("asc");

  const searchRef = useRef("");
  const LIMIT = 25;

  // Lista de universidades para el filtro, acotada por CCAA si hay una seleccionada
  const universidadesFiltradas = filtroCC
    ? universidades.filter((u) => String(u.id_comunidad) === String(filtroCC))
    : universidades;

  const fetchMasters = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:          String(overrides.page      ?? page),
        limit:         String(LIMIT),
        search:        overrides.search           !== undefined ? overrides.search      : searchRef.current,
        id_comunidad:  overrides.filtroCC         !== undefined ? overrides.filtroCC    : filtroCC,
        id_universidad: overrides.filtroUniv      !== undefined ? overrides.filtroUniv  : filtroUniv,
        rama:          overrides.filtroRama       !== undefined ? overrides.filtroRama  : filtroRama,
        modalidad:     overrides.filtroMod        !== undefined ? overrides.filtroMod   : filtroMod,
        activo:        overrides.filtroActivo     !== undefined ? overrides.filtroActivo: filtroActivo,
        sortBy:        overrides.sortCol          !== undefined ? overrides.sortCol     : sortCol,
        sortDir:       overrides.sortDir          !== undefined ? overrides.sortDir     : sortDir,
      });
      ["search", "id_comunidad", "id_universidad", "rama", "modalidad", "activo"].forEach((k) => {
        if (!q.get(k)) q.delete(k);
      });
      const data = await boGET(`/backoffice/catalogo/masters?${q}`);
      if (data.ok) { setMasters(data.masters); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, filtroCC, filtroUniv, filtroRama, filtroMod, filtroActivo, sortCol, sortDir]);

  useEffect(() => { fetchMasters(); }, [fetchMasters]);

  function applySearch() {
    searchRef.current = search;
    setPage(1);
    fetchMasters({ page: 1, search });
  }
  function resetSearch() {
    setSearch(""); searchRef.current = "";
    setPage(1); fetchMasters({ page: 1, search: "" });
  }
  function handleFilter(key, val, setter) {
    setter(val); setPage(1);
    fetchMasters({ page: 1, [key]: val });
  }
  // Al cambiar CCAA, resetear también el filtro de universidad
  function handleFiltroCC(val) {
    setFiltroCC(val);
    setFiltroUniv("");
    setPage(1);
    fetchMasters({ page: 1, filtroCC: val, filtroUniv: "" });
  }
  function handleSort(col) {
    const newDir = sortCol === col && sortDir === "asc" ? "desc" : "asc";
    setSortCol(col); setSortDir(newDir); setPage(1);
    fetchMasters({ page: 1, sortCol: col, sortDir: newDir });
  }

  async function toggleEstado(m) {
    setToggling(m.id_master);
    try { await boPOST(`/backoffice/catalogo/masters/${m.id_master}/estado`, { activo: !m.activo }); fetchMasters(); }
    finally { setToggling(null); }
  }

  const totalPages = Math.ceil(total / LIMIT);
  const thProps = { sortCol, sortDir, onSort: handleSort };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Másteres</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            precio = ECTS × €/crédito CCAA
            {total > 0 && <span className="ml-2 text-neutral-400">— {total} registros</span>}
          </p>
        </div>
        <button onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
          <span className="text-lg leading-none">+</span> Nuevo máster
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-1 min-w-[220px] items-center gap-1">
          <input className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Buscar por nombre…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()} />
          <button onClick={applySearch} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition">Buscar</button>
          {search && (
            <button onClick={resetSearch} className="px-3 py-1.5 text-sm text-neutral-500 border rounded-lg hover:bg-neutral-50 transition">✕</button>
          )}
        </div>
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroCC} onChange={(e) => handleFiltroCC(e.target.value)}>
          <option value="">Todas las CCAA</option>
          {comunidades.map((c) => <option key={c.id_comunidad} value={c.id_comunidad}>{c.nombre}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroUniv} onChange={(e) => handleFilter("filtroUniv", e.target.value, setFiltroUniv)}>
          <option value="">Todas las universidades</option>
          {universidadesFiltradas.map((u) => (
            <option key={u.id_universidad} value={u.id_universidad}>{u.sigla} — {u.nombre_completo}</option>
          ))}
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroRama} onChange={(e) => handleFilter("filtroRama", e.target.value, setFiltroRama)}>
          <option value="">Todas las ramas</option>
          {RAMAS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroMod} onChange={(e) => handleFilter("filtroMod", e.target.value, setFiltroMod)}>
          <option value="">Todas las modalidades</option>
          {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroActivo} onChange={(e) => handleFilter("filtroActivo", e.target.value, setFiltroActivo)}>
          <option value="">Activos e inactivos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Universidad</th>
              <Th col="nombre_limpio"         label="Máster"      {...thProps} />
              <Th col="rama"                  label="Rama"        {...thProps} />
              <Th col="modalidad"             label="Mod."        {...thProps} center />
              <Th col="ects"                  label="ECTS"        {...thProps} center />
              <Th col="precio_total_estimado" label="Precio est." {...thProps} right />
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && <tr><td colSpan={8} className="text-center py-10 text-neutral-400">Cargando…</td></tr>}
            {!loading && masters.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-neutral-400">Sin másteres</td></tr>}
            {!loading && masters.map((m) => {
              const badge     = activoBadge(m.activo);
              const ramaLabel = RAMAS.find((r) => r.value === m.rama)?.label || m.rama;
              const modLabel  = MODALIDADES.find((md) => md.value === m.modalidad)?.label || m.modalidad;
              return (
                <tr key={m.id_master} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">{m.universidad?.sigla}</span>
                    <span className="ml-1.5 text-xs text-neutral-500">{m.universidad?.comunidad?.nombre}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="truncate font-medium text-neutral-800" title={m.nombre_limpio}>{m.nombre_limpio}</p>
                    <p className="text-xs text-neutral-400 truncate">{m.titulo_acceso || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">{ramaLabel}</td>
                  <td className="px-4 py-3 text-center text-xs text-neutral-600 whitespace-nowrap">{modLabel}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-700">{m.ects}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">{formatPrecio(m.precio_total_estimado)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal({ item: m })} className="text-xs text-primary hover:underline">Editar</button>
                      <button disabled={toggling === m.id_master} onClick={() => toggleEstado(m)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40">
                        {m.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-neutral-500">Página {page} de {totalPages} — {total} másteres</span>
          <div className="flex gap-2">
            <button disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchMasters({ page: p }); }}
              className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition">← Anterior</button>
            <button disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); fetchMasters({ page: p }); }}
              className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition">Siguiente →</button>
          </div>
        </div>
      )}

      {modal && (
        <ModalMaster item={modal.item} universidades={universidades} comunidades={comunidades} ramas={ramas}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); fetchMasters(); }} />
      )}
    </div>
  );
}
