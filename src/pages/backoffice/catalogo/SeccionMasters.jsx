// SeccionMasters.jsx — CRUD Másteres
// precio_total_estimado = ects × precio_credito_extranjero de la CCAA de la universidad.
// El cálculo lo hace el backend; el frontend muestra una vista previa basada en los dropdowns.
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import {
  RAMAS, MODALIDADES, TIENE_PRACTICAS_OPCIONES,
  formatPrecio, duracionLabel, activoBadge, listaBadge,
  MODAL_OVERLAY, MODAL_PANEL,
} from "./catalogoConstants";

const FORM_INIT = {
  id_universidad: "",
  nombre_limpio: "",
  nombre_original: "",
  rama: "CIENCIAS_SOCIALES_JURIDICAS",
  modalidad: "PRESENCIAL",
  ects: "60",
  es_habilitante: false,
  tiene_practicas: "",
  es_interuniversitario: false,
  es_dual: false,
  titulo_acceso: "",
  notas: "",
  activo: true,
};

// ── Modal crear / editar ──────────────────────────────────────────────────────
function ModalMaster({ item, universidades, comunidades, onClose, onSaved }) {
  const isEdit = !!item?.id_master;
  const [form, setForm] = useState(
    isEdit
      ? {
          id_universidad:       String(item.id_universidad),
          nombre_limpio:        item.nombre_limpio        || "",
          nombre_original:      item.nombre_original      || "",
          rama:                 item.rama                 || "CIENCIAS_SOCIALES_JURIDICAS",
          modalidad:            item.modalidad            || "PRESENCIAL",
          ects:                 String(item.ects          || 60),
          es_habilitante:       !!item.es_habilitante,
          tiene_practicas:      item.tiene_practicas == null ? "" : String(item.tiene_practicas),
          es_interuniversitario: !!item.es_interuniversitario,
          es_dual:              !!item.es_dual,
          titulo_acceso:        item.titulo_acceso        || "",
          notas:                item.notas                || "",
          activo:               item.activo,
        }
      : { ...FORM_INIT }
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Vista previa del precio calculado
  const univSeleccionada = universidades.find(
    (u) => String(u.id_universidad) === String(form.id_universidad)
  );
  const comunidadDeUniv = univSeleccionada
    ? comunidades.find((c) => c.id_comunidad === univSeleccionada.id_comunidad)
    : null;
  const precioPreview = comunidadDeUniv && form.ects
    ? Number(comunidadDeUniv.precio_credito_extranjero) * Number(form.ects)
    : null;

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const url = isEdit
        ? `/backoffice/catalogo/masters/${item.id_master}`
        : "/backoffice/catalogo/masters";
      const data = await boPOST(url, {
        id_universidad:       form.id_universidad,
        nombre_limpio:        form.nombre_limpio,
        nombre_original:      form.nombre_original || form.nombre_limpio,
        rama:                 form.rama,
        modalidad:            form.modalidad,
        ects:                 form.ects,
        es_habilitante:       form.es_habilitante,
        tiene_practicas:      form.tiene_practicas === "" ? null : form.tiene_practicas,
        es_interuniversitario: form.es_interuniversitario,
        es_dual:              form.es_dual,
        titulo_acceso:        form.titulo_acceso || null,
        notas:                form.notas         || null,
        activo:               form.activo,
      });
      if (!data.ok) throw new Error(data.msg || "Error guardando");
      onSaved();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={MODAL_OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL_PANEL}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-primary">
            {isEdit ? "Editar Máster" : "Nuevo Máster"}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">✕</button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}

          {/* Universidad */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Universidad *</label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.id_universidad}
              onChange={(e) => set("id_universidad", e.target.value)}
            >
              <option value="">Seleccionar…</option>
              {universidades.map((u) => (
                <option key={u.id_universidad} value={u.id_universidad}>
                  {u.sigla} — {u.nombre_completo}
                </option>
              ))}
            </select>
            {comunidadDeUniv && (
              <p className="mt-1 text-xs text-neutral-500">
                CCAA: {comunidadDeUniv.nombre} — {formatPrecio(comunidadDeUniv.precio_credito_extranjero)}/crédito
              </p>
            )}
          </div>

          {/* Nombre limpio */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre limpio *</label>
            <input
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_limpio}
              onChange={(e) => set("nombre_limpio", e.target.value)}
              placeholder="Sin sufijos como '(a distancia)' o '(Interuniversitario)'"
            />
          </div>

          {/* Nombre original */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre original</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.nombre_original}
              onChange={(e) => set("nombre_original", e.target.value)}
              placeholder="Tal cual aparece en la web de la universidad (opcional)"
            />
          </div>

          {/* Rama + Modalidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Rama *</label>
              <select
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.rama}
                onChange={(e) => set("rama", e.target.value)}
              >
                {RAMAS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Modalidad *</label>
              <select
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.modalidad}
                onChange={(e) => set("modalidad", e.target.value)}
              >
                {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* ECTS + Precio preview */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">
              ECTS *
              <span className="ml-1 font-normal text-neutral-400">
                — precio = ECTS × €/crédito de la CCAA
              </span>
            </label>
            <input
              required
              type="number"
              min="1"
              max="300"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.ects}
              onChange={(e) => set("ects", e.target.value)}
            />
            {precioPreview != null && (
              <p className="mt-1 text-xs text-neutral-500">
                Precio estimado:{" "}
                <span className="font-semibold text-neutral-700">{formatPrecio(precioPreview)}</span>
                {" · Duración: "}
                <span className="font-semibold text-neutral-700">
                  {duracionLabel(
                    Number(form.ects) <= 60 ? 1 : Number(form.ects) <= 90 ? 1.5 : 2
                  )}
                </span>
              </p>
            )}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              ["es_habilitante",       "Máster habilitante"],
              ["es_interuniversitario","Interuniversitario"],
              ["es_dual",              "Dual (empresa)"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                {label}
              </label>
            ))}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Prácticas</label>
              <select
                className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.tiene_practicas}
                onChange={(e) => set("tiene_practicas", e.target.value)}
              >
                {TIENE_PRACTICAS_OPCIONES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Título de acceso */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Título de acceso</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.titulo_acceso}
              onChange={(e) => set("titulo_acceso", e.target.value)}
              placeholder="Carreras que dan acceso al máster"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">Notas internas</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
            />
          </div>

          {/* Activo */}
          <div className="flex items-center gap-2">
            <input
              id="master-activo"
              type="checkbox"
              checked={form.activo}
              onChange={(e) => set("activo", e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <label htmlFor="master-activo" className="text-sm text-neutral-700">Activo</label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-neutral-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
            >
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear máster"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla principal ───────────────────────────────────────────────────────────
export default function SeccionMasters({ universidades, comunidades }) {
  const [masters,    setMasters]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(null);
  const [toggling,   setToggling]   = useState(null);

  // Filtros
  const [search,      setSearch]      = useState("");
  const [filtroCC,    setFiltroCC]    = useState("");
  const [filtroRama,  setFiltroRama]  = useState("");
  const [filtroMod,   setFiltroMod]   = useState("");
  const [filtroActivo,setFiltroActivo]= useState("");

  const searchInput = useRef("");
  const LIMIT = 25;

  const fetchMasters = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page:      String(overrides.page  ?? page),
        limit:     String(LIMIT),
        search:    overrides.search     !== undefined ? overrides.search     : searchInput.current,
        id_comunidad: overrides.filtroCC   !== undefined ? overrides.filtroCC   : filtroCC,
        rama:      overrides.filtroRama  !== undefined ? overrides.filtroRama  : filtroRama,
        modalidad: overrides.filtroMod   !== undefined ? overrides.filtroMod   : filtroMod,
        activo:    overrides.filtroActivo!== undefined ? overrides.filtroActivo : filtroActivo,
      });
      // Remove empty params
      ["search", "id_comunidad", "rama", "modalidad", "activo"].forEach((k) => {
        if (!q.get(k)) q.delete(k);
      });
      const data = await boGET(`/backoffice/catalogo/masters?${q}`);
      if (data.ok) { setMasters(data.masters); setTotal(data.total); }
    } finally {
      setLoading(false);
    }
  }, [page, filtroCC, filtroRama, filtroMod, filtroActivo]);

  useEffect(() => { fetchMasters(); }, [fetchMasters]);

  function applySearch() {
    searchInput.current = search;
    const newPage = 1;
    setPage(newPage);
    fetchMasters({ page: newPage, search });
  }

  function resetSearch() {
    setSearch("");
    searchInput.current = "";
    const newPage = 1;
    setPage(newPage);
    fetchMasters({ page: newPage, search: "" });
  }

  function handleFilterChange(key, val, setter) {
    setter(val);
    const newPage = 1;
    setPage(newPage);
    fetchMasters({ page: newPage, [key]: val });
  }

  async function toggleEstado(m) {
    setToggling(m.id_master);
    try {
      await boPOST(`/backoffice/catalogo/masters/${m.id_master}/estado`, { activo: !m.activo });
      fetchMasters();
    } finally {
      setToggling(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-800">Másteres</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            precio_total_estimado = ECTS × €/crédito de la CCAA
            {total > 0 && <span className="ml-2 text-neutral-400">— {total} registros</span>}
          </p>
        </div>
        <button
          onClick={() => setModal({ item: null })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
        >
          <span className="text-lg leading-none">+</span> Nuevo máster
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-1 min-w-[220px] items-center gap-1">
          <input
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <button
            onClick={applySearch}
            className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Buscar
          </button>
          {search && (
            <button
              onClick={resetSearch}
              className="px-3 py-1.5 text-sm text-neutral-500 border rounded-lg hover:bg-neutral-50 transition"
            >
              ✕
            </button>
          )}
        </div>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroCC}
          onChange={(e) => handleFilterChange("filtroCC", e.target.value, setFiltroCC)}
        >
          <option value="">Todas las CCAA</option>
          {comunidades.map((c) => (
            <option key={c.id_comunidad} value={c.id_comunidad}>{c.nombre}</option>
          ))}
        </select>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroRama}
          onChange={(e) => handleFilterChange("filtroRama", e.target.value, setFiltroRama)}
        >
          <option value="">Todas las ramas</option>
          {RAMAS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroMod}
          onChange={(e) => handleFilterChange("filtroMod", e.target.value, setFiltroMod)}
        >
          <option value="">Todas las modalidades</option>
          {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filtroActivo}
          onChange={(e) => handleFilterChange("filtroActivo", e.target.value, setFiltroActivo)}
        >
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
              <th className="text-left px-4 py-3">Máster</th>
              <th className="text-left px-4 py-3">Rama</th>
              <th className="text-center px-4 py-3">Mod.</th>
              <th className="text-center px-4 py-3">ECTS</th>
              <th className="text-right px-4 py-3">Precio est.</th>
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-neutral-400">Cargando…</td>
              </tr>
            )}
            {!loading && masters.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-neutral-400">Sin másteres</td>
              </tr>
            )}
            {!loading && masters.map((m) => {
              const badge  = activoBadge(m.activo);
              const ramaLabel = RAMAS.find((r) => r.value === m.rama)?.label || m.rama;
              const modLabel  = MODALIDADES.find((md) => md.value === m.modalidad)?.label || m.modalidad;
              return (
                <tr key={m.id_master} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                      {m.universidad?.sigla}
                    </span>
                    <span className="ml-1.5 text-xs text-neutral-500">
                      {m.universidad?.comunidad?.nombre}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <p className="truncate font-medium text-neutral-800" title={m.nombre_limpio}>
                      {m.nombre_limpio}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{m.titulo_acceso || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600 whitespace-nowrap">{ramaLabel}</td>
                  <td className="px-4 py-3 text-center text-xs text-neutral-600 whitespace-nowrap">{modLabel}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-neutral-700">{m.ects}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {formatPrecio(m.precio_total_estimado)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModal({ item: m })}
                        className="text-xs text-primary hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        disabled={toggling === m.id_master}
                        onClick={() => toggleEstado(m)}
                        className="text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-40"
                      >
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
          <span className="text-neutral-500">
            Página {page} de {totalPages} — {total} másteres en total
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => { const p = page - 1; setPage(p); fetchMasters({ page: p }); }}
              className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition"
            >
              ← Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => { const p = page + 1; setPage(p); fetchMasters({ page: p }); }}
              className="px-3 py-1.5 border rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {modal && (
        <ModalMaster
          item={modal.item}
          universidades={universidades}
          comunidades={comunidades}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchMasters(); }}
        />
      )}
    </div>
  );
}
