// src/pages/backoffice/catalogo/CatalogoMasters.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

const RAMAS = {
  CIENCIAS: "Ciencias",
  CIENCIAS_SALUD: "CC. Salud",
  CIENCIAS_SOCIALES_JURIDICAS: "CC. Sociales y Jurídicas",
  INGENIERIA_ARQUITECTURA: "Ingeniería y Arquitectura",
  ARTES_HUMANIDADES: "Artes y Humanidades",
};

const MODALIDADES = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
  SEMIPRESENCIAL: "Semipresencial",
  HIBRIDA: "Híbrida",
};

const FORM_INIT = {
  id_comunidad_form: "",
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
};

const LIMIT = 25;

function formatPrecio(val) {
  if (val == null) return "—";
  return `${Number(val).toLocaleString("es-ES")} €`;
}

export default function CatalogoMasters() {
  const [masters, setMasters] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filtroCom, setFiltroCom] = useState("");
  const [filtroRama, setFiltroRama] = useState("");
  const [filtroMod, setFiltroMod] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");

  // Reference data
  const [comunidades, setComunidades] = useState([]);
  const [todasUnis, setTodasUnis] = useState([]);
  const [formUnis, setFormUnis] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_INIT);

  // ── Fetch reference data once ────────────────────────────────────────
  useEffect(() => {
    boGET("/backoffice/catalogo/comunidades").then((r) => {
      if (r.ok) setComunidades(r.comunidades);
    });
    boGET("/backoffice/catalogo/universidades").then((r) => {
      if (r.ok) setTodasUnis(r.universidades);
    });
    fetchMasters({});
  }, []);

  // ── Filter form unis by selected comunidad ───────────────────────────
  useEffect(() => {
    if (form.id_comunidad_form) {
      setFormUnis(todasUnis.filter((u) => u.id_comunidad === Number(form.id_comunidad_form)));
    } else {
      setFormUnis(todasUnis);
    }
  }, [form.id_comunidad_form, todasUnis]);

  // ── Core fetch (accepts explicit overrides to avoid stale closures) ──
  async function fetchMasters(overrides) {
    setLoading(true);
    const s = "search" in overrides ? overrides.search : search;
    const com = "filtroCom" in overrides ? overrides.filtroCom : filtroCom;
    const rama = "filtroRama" in overrides ? overrides.filtroRama : filtroRama;
    const mod = "filtroMod" in overrides ? overrides.filtroMod : filtroMod;
    const act = "filtroActivo" in overrides ? overrides.filtroActivo : filtroActivo;
    const pg = "page" in overrides ? overrides.page : page;

    const params = new URLSearchParams({ page: pg, limit: LIMIT });
    if (s) params.set("search", s);
    if (com) params.set("id_comunidad", com);
    if (rama) params.set("rama", rama);
    if (mod) params.set("modalidad", mod);
    if (act !== "") params.set("activo", act);

    const r = await boGET(`/backoffice/catalogo/masters?${params}`);
    if (r.ok) {
      setMasters(r.masters);
      setTotal(r.total);
    }
    setLoading(false);
  }

  // ── Filter handlers ──────────────────────────────────────────────────
  function onDropdownChange(setter, key, value) {
    setter(value);
    setPage(1);
    fetchMasters({ [key]: value, page: 1 });
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchMasters({ page: 1 });
  }

  function resetFilters() {
    setSearch("");
    setFiltroCom("");
    setFiltroRama("");
    setFiltroMod("");
    setFiltroActivo("");
    setPage(1);
    fetchMasters({ search: "", filtroCom: "", filtroRama: "", filtroMod: "", filtroActivo: "", page: 1 });
  }

  function goPage(newPage) {
    setPage(newPage);
    fetchMasters({ page: newPage });
  }

  // ── Modal helpers ────────────────────────────────────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(FORM_INIT);
    setModalOpen(true);
  }

  function openEdit(m) {
    setEditingId(m.id_master);
    setForm({
      id_comunidad_form: String(m.universidad.id_comunidad ?? ""),
      id_universidad: String(m.id_universidad),
      nombre_limpio: m.nombre_limpio || "",
      nombre_original: m.nombre_original || "",
      rama: m.rama,
      modalidad: m.modalidad,
      ects: String(m.ects),
      es_habilitante: !!m.es_habilitante,
      tiene_practicas: m.tiene_practicas === null || m.tiene_practicas === undefined ? "" : String(m.tiene_practicas),
      es_interuniversitario: !!m.es_interuniversitario,
      es_dual: !!m.es_dual,
      titulo_acceso: m.titulo_acceso || "",
      notas: m.notas || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(FORM_INIT);
  }

  function onFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  // ── Submit ───────────────────────────────────────────────────────────
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.id_universidad || !form.nombre_limpio || !form.rama || !form.modalidad || !form.ects) {
      alert("Completa los campos obligatorios marcados con *");
      return;
    }
    setSaving(true);
    const payload = {
      id_universidad: Number(form.id_universidad),
      nombre_limpio: form.nombre_limpio,
      nombre_original: form.nombre_original || form.nombre_limpio,
      rama: form.rama,
      modalidad: form.modalidad,
      ects: Number(form.ects),
      es_habilitante: form.es_habilitante,
      tiene_practicas: form.tiene_practicas,
      es_interuniversitario: form.es_interuniversitario,
      es_dual: form.es_dual,
      titulo_acceso: form.titulo_acceso,
      notas: form.notas,
    };
    const url = editingId
      ? `/backoffice/catalogo/masters/${editingId}`
      : "/backoffice/catalogo/masters";
    const r = await boPOST(url, payload);
    setSaving(false);
    if (!r.ok) { alert(r.msg || "Error guardando"); return; }
    closeModal();
    fetchMasters({});
  }

  // ── Toggle activo ────────────────────────────────────────────────────
  async function toggleActivo(m) {
    const r = await boPOST(`/backoffice/catalogo/masters/${m.id_master}/estado`, { activo: !m.activo });
    if (!r.ok) { alert(r.msg || "Error actualizando estado"); return; }
    setMasters((prev) =>
      prev.map((x) => (x.id_master === m.id_master ? { ...x, activo: !m.activo } : x))
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Catálogo de Másteres</h1>
          {!loading && (
            <p className="text-sm text-neutral-500 mt-0.5">{total.toLocaleString()} registros</p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          + Nuevo Máster
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-medium text-neutral-600 block mb-1">Buscar por nombre</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Máster en marketing…"
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="text-xs font-medium text-neutral-600 block mb-1">Comunidad</label>
            <select
              value={filtroCom}
              onChange={(e) => onDropdownChange(setFiltroCom, "filtroCom", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todas</option>
              {comunidades.map((c) => (
                <option key={c.id_comunidad} value={c.id_comunidad}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[170px]">
            <label className="text-xs font-medium text-neutral-600 block mb-1">Rama</label>
            <select
              value={filtroRama}
              onChange={(e) => onDropdownChange(setFiltroRama, "filtroRama", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todas</option>
              {Object.entries(RAMAS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[140px]">
            <label className="text-xs font-medium text-neutral-600 block mb-1">Modalidad</label>
            <select
              value={filtroMod}
              onChange={(e) => onDropdownChange(setFiltroMod, "filtroMod", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todas</option>
              {Object.entries(MODALIDADES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[110px]">
            <label className="text-xs font-medium text-neutral-600 block mb-1">Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) => onDropdownChange(setFiltroActivo, "filtroActivo", e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90 transition"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-10 text-center text-sm text-neutral-400">Cargando…</div>
        )}

        {!loading && masters.length === 0 && (
          <div className="p-10 text-center text-sm text-neutral-400">Sin resultados para los filtros seleccionados.</div>
        )}

        {!loading && masters.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Univ.</th>
                  <th className="px-4 py-3">Comunidad</th>
                  <th className="px-4 py-3">Rama</th>
                  <th className="px-4 py-3">Modalidad</th>
                  <th className="px-4 py-3 text-center">ECTS</th>
                  <th className="px-4 py-3">Precio est.</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {masters.map((m) => (
                  <tr
                    key={m.id_master}
                    className={`border-t hover:bg-neutral-50 transition-colors ${!m.activo ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-neutral-800 max-w-xs">
                      <span className="line-clamp-2 leading-snug">{m.nombre_limpio}</span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600 whitespace-nowrap">{m.universidad.sigla}</td>
                    <td className="px-4 py-2.5 text-neutral-600 whitespace-nowrap">{m.universidad.comunidad?.nombre}</td>
                    <td className="px-4 py-2.5 text-neutral-600 whitespace-nowrap text-xs">{RAMAS[m.rama] ?? m.rama}</td>
                    <td className="px-4 py-2.5 text-neutral-600 whitespace-nowrap">{MODALIDADES[m.modalidad] ?? m.modalidad}</td>
                    <td className="px-4 py-2.5 text-neutral-600 text-center">{m.ects}</td>
                    <td className="px-4 py-2.5 text-neutral-600 whitespace-nowrap">{formatPrecio(m.precio_total_estimado)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {m.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(m)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                            m.activo
                              ? "border-red-300 text-red-600 hover:bg-red-50"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {m.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-neutral-600 bg-neutral-50/60">
            <span>
              Página {page} de {totalPages} · {total.toLocaleString()} registros
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-white transition"
              >
                ← Anterior
              </button>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 disabled:opacity-40 hover:bg-white transition"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-primary">
                {editingId ? "Editar Máster" : "Nuevo Máster"}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={onSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

              {/* Comunidad + Universidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">
                    Comunidad <span className="text-neutral-400 font-normal">(filtra universidades)</span>
                  </label>
                  <select
                    name="id_comunidad_form"
                    value={form.id_comunidad_form}
                    onChange={onFormChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Todas las comunidades</option>
                    {comunidades.map((c) => (
                      <option key={c.id_comunidad} value={c.id_comunidad}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">Universidad *</label>
                  <select
                    name="id_universidad"
                    value={form.id_universidad}
                    onChange={onFormChange}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Seleccionar…</option>
                    {formUnis.map((u) => (
                      <option key={u.id_universidad} value={u.id_universidad}>
                        {u.sigla} — {u.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nombre limpio */}
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Nombre del máster *</label>
                <input
                  name="nombre_limpio"
                  value={form.nombre_limpio}
                  onChange={onFormChange}
                  required
                  placeholder="Sin anotaciones entre paréntesis"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Nombre original */}
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">
                  Nombre original <span className="text-neutral-400 font-normal">(opcional, tal como aparece en el catálogo oficial)</span>
                </label>
                <input
                  name="nombre_original"
                  value={form.nombre_original}
                  onChange={onFormChange}
                  placeholder="Ej: Máster en Marketing Digital (a distancia)"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Rama + Modalidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">Rama de conocimiento *</label>
                  <select
                    name="rama"
                    value={form.rama}
                    onChange={onFormChange}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {Object.entries(RAMAS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">Modalidad *</label>
                  <select
                    name="modalidad"
                    value={form.modalidad}
                    onChange={onFormChange}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {Object.entries(MODALIDADES).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ECTS + Tiene prácticas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">ECTS *</label>
                  <select
                    name="ects"
                    value={form.ects}
                    onChange={onFormChange}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="60">60 ECTS — 1 año</option>
                    <option value="90">90 ECTS — 1,5 años</option>
                    <option value="120">120 ECTS — 2 años</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">¿Tiene prácticas?</label>
                  <select
                    name="tiene_practicas"
                    value={form.tiene_practicas}
                    onChange={onFormChange}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Sin dato</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-5 pt-1">
                {[
                  { name: "es_habilitante", label: "Es habilitante" },
                  { name: "es_interuniversitario", label: "Interuniversitario" },
                  { name: "es_dual", label: "Dual" },
                ].map(({ name, label }) => (
                  <label key={name} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name={name}
                      checked={form[name]}
                      onChange={onFormChange}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Título acceso */}
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">
                  Títulos de acceso <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  name="titulo_acceso"
                  value={form.titulo_acceso}
                  onChange={onFormChange}
                  rows={2}
                  placeholder="Carreras y titulaciones que dan acceso al programa"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">
                  Notas <span className="text-neutral-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={onFormChange}
                  rows={2}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
            </form>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="text-sm px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                disabled={saving}
                className="text-sm px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear máster"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
