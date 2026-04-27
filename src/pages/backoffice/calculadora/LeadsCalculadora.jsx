import { useEffect, useState } from "react";
import { boGET, boPATCH, boDELETE } from "../../../services/backofficeApi";

const VIDA_LABEL = { economico: "Económico", equilibrado: "Equilibrado", ambicioso: "Ambicioso" };
const PAGE_SIZE  = 50;

function fmtFechaHora(iso) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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

  // CRUD
  const [editingId,  setEditingId]  = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);
  // confirmDel guarda { id, nombre } del lead a eliminar, null = cerrado
  const [confirmDel, setConfirmDel] = useState(null);

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

  function startEdit(l) {
    setEditingId(l.id_lead);
    setEditForm({ nombre: l.nombre, email: l.email || "", whatsapp: l.whatsapp || "" });
  }
  function cancelEdit() { setEditingId(null); setEditForm({}); }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const res = await boPATCH(`/backoffice/calculadora/leads/${id}`, editForm);
      if (res.ok) { cancelEdit(); cargar(); }
    } finally { setSaving(false); }
  }

  function pedirEliminar(l) {
    setEditingId(null);
    setConfirmDel({ id: l.id_lead, nombre: l.nombre });
  }

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

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hayFiltros = filtroNombre || filtroPais || filtroArea || filtroPerfil || filtroAuip;

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {/* ── Modal confirmación eliminar ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
                🗑️
              </div>
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
              <button
                onClick={() => setConfirmDel(null)}
                className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
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
          className="flex-1 min-w-[140px] border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Buscar nombre…"
          value={filtroNombre}
          onChange={e => { setFiltroNombre(e.target.value); resetPage(); }}
        />
        <input
          className="w-full sm:w-28 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="País…"
          value={filtroPais}
          onChange={e => { setFiltroPais(e.target.value); resetPage(); }}
        />
        <input
          className="flex-1 min-w-[140px] border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          <button
            onClick={limpiarFiltros}
            className="px-3 py-2 text-xs text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 whitespace-nowrap"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-sm" style={{ minWidth: "1350px" }}>
          <thead>
            <tr className="bg-secondary-light text-primary text-left">
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Fecha / Hora</th>
              <th className="px-3 py-3 font-semibold" style={{ minWidth: 130 }}>Nombre</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">País</th>
              <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Nota ES</th>
              <th className="px-3 py-3 font-semibold" style={{ minWidth: 150 }}>Área</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Presup.</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Perfil</th>
              <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">AUIP</th>
              <th className="px-3 py-3 font-semibold" style={{ minWidth: 170 }}>Email</th>
              <th className="px-3 py-3 font-semibold" style={{ minWidth: 120 }}>WhatsApp</th>
              <th className="px-3 py-3 font-semibold" style={{ minWidth: 200 }}>Becas</th>
              <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-neutral-400">Cargando...</td></tr>
            )}
            {!loading && leads.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-neutral-400">Sin leads todavía.</td></tr>
            )}
            {!loading && leads.map((l, i) => {
              const editing = editingId === l.id_lead;
              const rowBg   = editing
                ? "bg-blue-50/70"
                : i % 2 === 0
                ? "hover:bg-secondary-light/50"
                : "bg-neutral-50/40 hover:bg-secondary-light/50";
              return (
                <tr key={l.id_lead} className={`border-t border-neutral-100 transition ${rowBg}`}>

                  <td className="px-3 py-2.5 text-neutral-500 text-xs whitespace-nowrap">
                    {fmtFechaHora(l.fecha_creacion)}
                  </td>

                  <td className="px-3 py-2.5 font-medium text-primary">
                    {editing
                      ? <input
                          autoFocus
                          className="border border-primary/40 rounded px-2 py-1 text-sm w-full"
                          value={editForm.nombre}
                          onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                        />
                      : <span className="whitespace-nowrap">{l.nombre}</span>}
                  </td>

                  <td className="px-3 py-2.5 text-sm whitespace-nowrap">{l.pais}</td>

                  <td className="px-3 py-2.5 font-semibold text-center text-sm">
                    {Number(l.nota_espana).toFixed(2)}
                  </td>

                  <td className="px-3 py-2.5 text-sm" title={l.area}>
                    <span className="block" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.area}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-sm whitespace-nowrap">
                    {l.presupuesto.toLocaleString("es-ES")} €
                  </td>

                  <td className="px-3 py-2.5 text-sm whitespace-nowrap">
                    {VIDA_LABEL[l.vida] ?? l.vida}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    {l.auip === "si"
                      ? <span className="text-emerald-600 font-bold">✓</span>
                      : <span className="text-neutral-300">—</span>}
                  </td>

                  <td className="px-3 py-2.5">
                    {editing
                      ? <input
                          type="email"
                          className="border border-primary/40 rounded px-2 py-1 text-xs w-full"
                          value={editForm.email}
                          onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        />
                      : l.email
                        ? <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline text-xs break-all">{l.email}</a>
                        : <span className="text-neutral-300">—</span>}
                  </td>

                  <td className="px-3 py-2.5">
                    {editing
                      ? <input
                          type="tel"
                          className="border border-primary/40 rounded px-2 py-1 text-xs w-full"
                          value={editForm.whatsapp}
                          onChange={e => setEditForm(f => ({ ...f, whatsapp: e.target.value }))}
                        />
                      : l.whatsapp
                        ? <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-xs whitespace-nowrap">{l.whatsapp}</a>
                        : <span className="text-neutral-300">—</span>}
                  </td>

                  <td className="px-3 py-2.5"><BecasPills becas={l.becas_califica} /></td>

                  <td className="px-3 py-2.5 text-center">
                    {editing ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => saveEdit(l.id_lead)}
                          disabled={saving}
                          className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                        >
                          {saving ? "…" : "Guardar"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 text-xs border border-neutral-200 rounded hover:bg-neutral-50 whitespace-nowrap"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => startEdit(l)}
                          className="px-2 py-1 text-xs text-neutral-600 border border-neutral-200 rounded hover:bg-neutral-50 transition"
                          title="Editar nombre / email / WhatsApp"
                        >
                          ✏️
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => pedirEliminar(l)}
                            className="px-2 py-1 text-xs text-red-400 border border-red-200 rounded hover:bg-red-50 transition"
                            title="Eliminar lead"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Móvil: cards ── */}
      <div className="sm:hidden space-y-3">
        {loading && <p className="text-center text-neutral-400 py-8 text-sm">Cargando…</p>}
        {!loading && leads.length === 0 && (
          <p className="text-center text-neutral-400 py-8 text-sm">Sin leads todavía.</p>
        )}
        {!loading && leads.map((l) => {
          const editing = editingId === l.id_lead;
          return (
            <div
              key={l.id_lead}
              className={`border rounded-xl p-4 shadow-sm space-y-2 ${
                editing ? "bg-blue-50 border-blue-200" : "bg-white border-neutral-200"
              }`}
            >
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

              {!editing && (
                <div className="flex flex-col gap-1 text-xs">
                  {l.email && (
                    <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline break-all">{l.email}</a>
                  )}
                  {l.whatsapp && (
                    <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">
                      📱 {l.whatsapp}
                    </a>
                  )}
                </div>
              )}

              {l.becas_califica && l.becas_califica.length > 0 && !editing && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {l.becas_califica.filter(b => b.estado === "si").map((b, i) => (
                    <span key={i} className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full">
                      ✓ {b.nombre.split("—")[0].trim()}
                    </span>
                  ))}
                  {l.becas_califica.filter(b => b.estado === "posible").map((b, i) => (
                    <span key={i} className="bg-yellow-100 text-yellow-700 text-[11px] px-2 py-0.5 rounded-full">
                      ~ {b.nombre.split("—")[0].trim()}
                    </span>
                  ))}
                </div>
              )}

              {editing ? (
                <div className="pt-2 border-t border-blue-200 space-y-2">
                  <input
                    autoFocus
                    className="w-full border border-primary/40 rounded px-2 py-1.5 text-sm"
                    placeholder="Nombre"
                    value={editForm.nombre}
                    onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  />
                  <input
                    type="email"
                    className="w-full border border-primary/40 rounded px-2 py-1.5 text-sm"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  />
                  <input
                    type="tel"
                    className="w-full border border-primary/40 rounded px-2 py-1.5 text-sm"
                    placeholder="WhatsApp"
                    value={editForm.whatsapp}
                    onChange={e => setEditForm(f => ({ ...f, whatsapp: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(l.id_lead)}
                      disabled={saving}
                      className="flex-1 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? "Guardando…" : "Guardar"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-1.5 text-sm border border-neutral-200 rounded hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-neutral-100 flex gap-2">
                  <button
                    onClick={() => startEdit(l)}
                    className="flex-1 py-1.5 text-xs text-neutral-600 border border-neutral-200 rounded hover:bg-neutral-50"
                  >
                    ✏️ Editar
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => pedirEliminar(l)}
                      className="px-4 py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-between text-sm">
          <span className="text-neutral-400 text-xs">Pág. {page} de {totalPages} · {total} registros</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm"
            >
              ← Anterior
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-secondary-light transition text-sm"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BecasPills({ becas }) {
  if (!becas || becas.length === 0) return <span className="text-neutral-300">—</span>;
  const califica = becas.filter(b => b.estado === "si");
  const posible  = becas.filter(b => b.estado === "posible");
  return (
    <div className="flex flex-wrap gap-1">
      {califica.map((b, i) => (
        <span key={i} className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
          ✓ {b.nombre.split("—")[0].trim()}
        </span>
      ))}
      {posible.map((b, i) => (
        <span key={i} className="bg-yellow-100 text-yellow-700 text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap">
          ~ {b.nombre.split("—")[0].trim()}
        </span>
      ))}
    </div>
  );
}
