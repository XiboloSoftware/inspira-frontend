import { useEffect, useState } from "react";
import { boGET, boPATCH, boDELETE } from "../../../services/backofficeApi";

const VIDA_LABEL = { economico: "Económico", equilibrado: "Equilibrado", ambicioso: "Ambicioso" };
const PAGE_SIZE  = 50;

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtHora(iso) {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
function fmtFechaHora(iso) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SortIcon({ active, dir }) {
  if (!active) return <span className="ml-0.5 opacity-30 text-[10px]">↕</span>;
  return <span className="ml-0.5 text-[10px]">{dir === "asc" ? "↑" : "↓"}</span>;
}

function ThSort({ label, campo, center, sortKey, sortDir, onSort }) {
  return (
    <th
      onClick={() => onSort(campo)}
      title={label}
      className={`px-3 py-3 font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-primary/10 transition overflow-hidden ${center ? "text-center" : ""}`}
    >
      {label}<SortIcon active={sortKey === campo} dir={sortDir} />
    </th>
  );
}

// ─── Becas con colapso ────────────────────────────────────────────────────────
function BecasPills({ becas }) {
  const [expanded, setExpanded] = useState(false);
  if (!becas || becas.length === 0) return <span className="text-neutral-300">—</span>;

  const califica = becas.filter(b => b.estado === "si");
  const posible  = becas.filter(b => b.estado === "posible");
  const all      = [...califica, ...posible];
  const visible  = expanded ? all : all.slice(0, 2);
  const ocultos  = all.length - 2;

  return (
    <div className="flex flex-wrap gap-1 items-start">
      {visible.map((b, i) => {
        const ok = b.estado === "si";
        return (
          <span
            key={i}
            className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${
              ok ? "bg-green-100 text-green-700 font-medium" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {ok ? "✓" : "~"} {b.nombre.split("—")[0].trim()}
          </span>
        );
      })}
      {!expanded && ocultos > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[11px] text-neutral-400 hover:text-primary border border-neutral-200 hover:border-primary/40 rounded-full px-2 py-0.5 transition whitespace-nowrap"
        >
          +{ocultos} más
        </button>
      )}
      {expanded && all.length > 2 && (
        <button
          onClick={() => setExpanded(false)}
          className="text-[11px] text-neutral-400 hover:text-primary border border-neutral-200 hover:border-primary/40 rounded-full px-2 py-0.5 transition whitespace-nowrap"
        >
          Ver menos
        </button>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LeadsCalculadora({ user }) {
  const isAdmin = user?.rol === "admin";

  const [leads,   setLeads]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroPais,   setFiltroPais]   = useState("");
  const [filtroArea,   setFiltroArea]   = useState("");
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [filtroAuip,   setFiltroAuip]   = useState("");

  // Modal editar
  const [modalEdit, setModalEdit] = useState(null); // null | { id, nombre, email, whatsapp }
  const [saving,    setSaving]    = useState(false);

  // Modal eliminar
  const [confirmDel, setConfirmDel] = useState(null); // null | { id, nombre }

  // Ordenamiento client-side
  const [sortKey, setSortKey] = useState("fecha_creacion");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => { cargar(); }, [page, filtroNombre, filtroPais, filtroArea, filtroPerfil, filtroAuip]); // eslint-disable-line

  async function cargar() {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (filtroNombre) p.set("nombre", filtroNombre);
      if (filtroPais)   p.set("pais",   filtroPais);
      if (filtroArea)   p.set("area",   filtroArea);
      if (filtroPerfil) p.set("vida",   filtroPerfil);
      if (filtroAuip)   p.set("auip",   filtroAuip);
      const data = await boGET(`/backoffice/calculadora/leads?${p}`);
      if (data.ok) { setLeads(data.leads); setTotal(data.pagination.total); }
    } finally { setLoading(false); }
  }

  function resetPage() { setPage(1); }

  // ── Editar ──
  function openEdit(l) {
    setModalEdit({ id: l.id_lead, nombre: l.nombre, email: l.email || "", whatsapp: l.whatsapp || "" });
  }
  function closeEdit() { setModalEdit(null); }
  async function saveModal() {
    if (!modalEdit) return;
    setSaving(true);
    try {
      const { id, nombre, email, whatsapp } = modalEdit;
      const res = await boPATCH(`/backoffice/calculadora/leads/${id}`, { nombre, email, whatsapp });
      if (res.ok) { closeEdit(); cargar(); }
    } finally { setSaving(false); }
  }

  // ── Eliminar ──
  function pedirEliminar(l) { setConfirmDel({ id: l.id_lead, nombre: l.nombre }); }
  async function confirmarEliminar() {
    if (!confirmDel) return;
    await boDELETE(`/backoffice/calculadora/leads/${confirmDel.id}`);
    setConfirmDel(null);
    cargar();
  }

  function limpiarFiltros() {
    setFiltroNombre(""); setFiltroPais(""); setFiltroArea("");
    setFiltroPerfil(""); setFiltroAuip(""); resetPage();
  }

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (sortKey === "fecha_creacion") {
      return sortDir === "asc" ? new Date(va) - new Date(vb) : new Date(vb) - new Date(va);
    }
    if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va;
    va = String(va ?? "").toLowerCase();
    vb = String(vb ?? "").toLowerCase();
    return sortDir === "asc" ? va.localeCompare(vb, "es") : vb.localeCompare(va, "es");
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hayFiltros = filtroNombre || filtroPais || filtroArea || filtroPerfil || filtroAuip;
  const sp = { sortKey, sortDir, onSort: toggleSort };

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* ── Modal: Editar lead ── */}
      {modalEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-neutral-800 text-base">Editar lead</h2>
              <button onClick={closeEdit} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Nombre</label>
                <input
                  autoFocus
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={modalEdit.nombre}
                  onChange={e => setModalEdit(m => ({ ...m, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={modalEdit.email}
                  onChange={e => setModalEdit(m => ({ ...m, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={modalEdit.whatsapp}
                  onChange={e => setModalEdit(m => ({ ...m, whatsapp: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={closeEdit} className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">
                Cancelar
              </button>
              <button onClick={saveModal} disabled={saving} className="flex-1 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar eliminar ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">🗑️</div>
              <div>
                <h2 className="font-bold text-neutral-800 text-base">Eliminar lead</h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Vas a eliminar permanentemente el lead de{" "}
                  <span className="font-semibold text-neutral-700">{confirmDel.nombre}</span>.
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              Esta acción <strong>no se puede deshacer</strong>. Los datos se eliminarán de forma permanente y no podrán recuperarse.
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Calculadora — Leads</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{total} registros totales</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap items-end">
        <input
          className="flex-1 min-w-[130px] border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar nombre…"
          value={filtroNombre}
          onChange={e => { setFiltroNombre(e.target.value); resetPage(); }}
        />
        <input
          className="w-full sm:w-24 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="País…"
          value={filtroPais}
          onChange={e => { setFiltroPais(e.target.value); resetPage(); }}
        />
        <input
          className="flex-1 min-w-[130px] border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Área de estudio…"
          value={filtroArea}
          onChange={e => { setFiltroArea(e.target.value); resetPage(); }}
        />
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          value={filtroPerfil}
          onChange={e => { setFiltroPerfil(e.target.value); resetPage(); }}
        >
          <option value="">Todos los perfiles</option>
          <option value="economico">Económico</option>
          <option value="equilibrado">Equilibrado</option>
          <option value="ambicioso">Ambicioso</option>
        </select>
        <button
          onClick={() => { setFiltroAuip(filtroAuip === "si" ? "" : "si"); resetPage(); }}
          className={`px-3 py-2 text-xs font-medium rounded-lg border transition whitespace-nowrap ${
            filtroAuip === "si"
              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
          }`}
        >
          ✓ AUIP
        </button>
        {hayFiltros && (
          <button onClick={limpiarFiltros} className="px-3 py-2 text-xs text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 whitespace-nowrap">
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "112px" }} />
            <col style={{ width: "112px" }} />
            <col style={{ width: "66px" }}  />
            <col style={{ width: "84px" }}  />
            <col style={{ width: "118px" }} />
            <col style={{ width: "80px" }}  />
            <col style={{ width: "80px" }}  />
            <col style={{ width: "52px" }}  />
            <col style={{ width: "142px" }} />
            <col style={{ width: "92px" }}  />
            <col />
            <col style={{ width: "76px" }}  />
          </colgroup>
          <thead>
            <tr className="bg-secondary-light text-primary text-left">
              <ThSort label="Fecha / Hora" campo="fecha_creacion" {...sp} />
              <ThSort label="Nombre"       campo="nombre"          {...sp} />
              <ThSort label="País"         campo="pais"            {...sp} />
              <ThSort label="Nota ES"      campo="nota_espana"     center {...sp} />
              <ThSort label="Área"         campo="area"            {...sp} />
              <ThSort label="Presup."      campo="presupuesto"     {...sp} />
              <ThSort label="Perfil"       campo="vida"            {...sp} />
              <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">AUIP</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Email</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">WhatsApp</th>
              <th className="px-3 py-3 font-semibold">Becas</th>
              <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-neutral-400">Cargando...</td></tr>
            )}
            {!loading && sortedLeads.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-neutral-400">Sin leads todavía.</td></tr>
            )}
            {!loading && sortedLeads.map((l, i) => (
              <tr
                key={l.id_lead}
                className={`border-t border-neutral-100 transition ${
                  i % 2 === 0 ? "hover:bg-secondary-light/50" : "bg-neutral-50/40 hover:bg-secondary-light/50"
                }`}
              >
                {/* Fecha arriba · hora abajo */}
                <td className="px-3 py-2.5">
                  <span className="block text-neutral-700 text-xs whitespace-nowrap">{fmtFecha(l.fecha_creacion)}</span>
                  <span className="block text-neutral-400 text-[11px] whitespace-nowrap">{fmtHora(l.fecha_creacion)}</span>
                </td>

                <td className="px-3 py-2.5 font-medium text-primary">
                  <span style={{ overflowWrap: "break-word" }}>{l.nombre}</span>
                </td>

                <td className="px-3 py-2.5 text-xs whitespace-nowrap">{l.pais}</td>

                <td className="px-3 py-2.5 font-semibold text-center text-sm">{Number(l.nota_espana).toFixed(2)}</td>

                <td className="px-3 py-2.5 text-xs" title={l.area}>
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {l.area}
                  </span>
                </td>

                <td className="px-3 py-2.5 text-xs whitespace-nowrap">{l.presupuesto.toLocaleString("es-ES")} €</td>

                <td className="px-3 py-2.5 text-xs whitespace-nowrap">{VIDA_LABEL[l.vida] ?? l.vida}</td>

                <td className="px-3 py-2.5 text-center">
                  {l.auip === "si" ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-neutral-300">—</span>}
                </td>

                <td className="px-3 py-2.5">
                  {l.email
                    ? <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs" style={{ overflowWrap: "break-word", wordBreak: "break-all" }}>{l.email}</a>
                    : <span className="text-neutral-300">—</span>}
                </td>

                <td className="px-3 py-2.5">
                  {l.whatsapp
                    ? <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs whitespace-nowrap">{l.whatsapp}</a>
                    : <span className="text-neutral-300">—</span>}
                </td>

                <td className="px-3 py-2.5"><BecasPills becas={l.becas_califica} /></td>

                <td className="px-3 py-2.5 text-center">
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => openEdit(l)} className="px-2 py-1 text-xs text-neutral-600 border border-neutral-200 rounded hover:bg-neutral-50 transition" title="Editar">✏️</button>
                    {isAdmin && (
                      <button onClick={() => pedirEliminar(l)} className="px-2 py-1 text-xs text-red-400 border border-red-200 rounded hover:bg-red-50 transition" title="Eliminar">🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Móvil: cards ── */}
      <div className="sm:hidden space-y-3">
        {loading && <p className="text-center text-neutral-400 py-8 text-sm">Cargando…</p>}
        {!loading && sortedLeads.length === 0 && <p className="text-center text-neutral-400 py-8 text-sm">Sin leads todavía.</p>}
        {!loading && sortedLeads.map((l) => (
          <div key={l.id_lead} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-sm truncate">{l.nombre}</p>
                <p className="text-xs text-neutral-400">{l.pais} · {fmtFechaHora(l.fecha_creacion)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-light text-primary font-medium whitespace-nowrap shrink-0">
                {VIDA_LABEL[l.vida] ?? l.vida}
              </span>
            </div>
            {l.area && <p className="text-xs text-neutral-600">{l.area}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="text-neutral-500">Nota ES: <b>{Number(l.nota_espana).toFixed(2)}</b></span>
              <span className="text-neutral-500">Presupuesto: <b>{l.presupuesto.toLocaleString("es-ES")} €</b></span>
              {l.auip === "si" && <span className="text-emerald-600 font-medium">✓ AUIP</span>}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              {l.email && <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline break-all">{l.email}</a>}
              {l.whatsapp && <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">📱 {l.whatsapp}</a>}
            </div>
            {l.becas_califica && l.becas_califica.length > 0 && (
              <div className="pt-1"><BecasPills becas={l.becas_califica} /></div>
            )}
            <div className="pt-2 border-t border-neutral-100 flex gap-2">
              <button onClick={() => openEdit(l)} className="flex-1 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded hover:bg-neutral-50">✏️ Editar</button>
              {isAdmin && <button onClick={() => pedirEliminar(l)} className="px-4 py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50">🗑️</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-between text-sm">
          <span className="text-neutral-400 text-xs">Pág. {page} de {totalPages} · {total} registros</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm">← Anterior</button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm">Siguiente →</button>
          </div>
        </div>
      )}
    </div>
  );
}
