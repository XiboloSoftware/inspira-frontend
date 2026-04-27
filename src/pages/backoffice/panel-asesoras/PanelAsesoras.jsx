// src/pages/backoffice/panel-asesoras/PanelAsesoras.jsx
import { useState, useEffect, useCallback } from "react";
import { boGET, boPOST, boPATCH, boDELETE } from "../../../services/backofficeApi";

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const SVC_KEYS = ["master", "visa", "ee", "fp", "legal"];
const SVC_LABELS = { master: "Máster", visa: "Visa estudios", ee: "Estancia est.", fp: "FP / Grado", legal: "Legal / RR" };
const TABS = [{ id: "all", label: "Todos" }, ...SVC_KEYS.map(s => ({ id: s, label: SVC_LABELS[s] }))];
const FASES_VE = ["Estrategia realizada", "Preparación documentaria", "Cita programada", "Documentos listos"];
const UNI_EST = ["ADMITIDO","LISTA DE ESPERA ALTA","LISTA DE ESPERA MEDIA","LISTA DE ESPERA BAJA","POSTULADO","POSTULAR","NO POSTULAR AUN","PROCESO PREVIO","PENDIENTE","EXCLUIDO","FINALIZADO"];
const ESTADOS = ["ACTIVO","NO_ACTIVO","ACTIVAR"];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function estadoLabel(e) { return e === "NO_ACTIVO" ? "NO ACTIVO" : e; }
function ini(name) { return (name || "?").split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function miss(v) { return !v || !String(v).trim(); }
function fv(v) { return miss(v) ? "—" : v; }
function mkFases() { return FASES_VE.map(l => ({ label: l, done: false, pendiente: "" })); }
function mkPagos() { return { tipo: "", total: "", pagadas: "", pendiente: "", cuotas: "" }; }

const SVC_COLORS = {
  master: { bg: "#EEEDFE", text: "#3C3489" },
  visa:   { bg: "#E6F1FB", text: "#0C447C" },
  ee:     { bg: "#E1F5EE", text: "#085041" },
  fp:     { bg: "#FAEEDA", text: "#633806" },
  legal:  { bg: "#FBEAF0", text: "#72243E" },
};

function estadoBadgeCls(e) {
  if (e === "ACTIVO")   return "bg-green-100 text-green-800";
  if (e === "ACTIVAR")  return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-600";
}

function uniEstCls(e) {
  if (e === "ADMITIDO") return "text-emerald-700 font-semibold";
  if (e?.includes("ESPERA")) return "text-amber-700";
  if (e === "POSTULADO" || e === "POSTULAR") return "text-blue-700";
  if (e === "EXCLUIDO") return "text-red-700";
  if (e === "NO POSTULAR AUN" || e === "NO_POSTULAR_AUN") return "text-neutral-400";
  return "text-neutral-500";
}

function exportJSON(data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = `inspira_panel_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */
export default function PanelAsesoras() {
  const [data, setData]               = useState({ master:[], visa:[], ee:[], fp:[], legal:[] });
  const [loading, setLoading]         = useState(true);
  const [curTab, setCurTab]           = useState("all");
  const [expandedKey, setExpandedKey] = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [addMode, setAddMode]         = useState(false);
  const [addSvc, setAddSvc]           = useState("master");
  const [search, setSearch]           = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [saving, setSaving]           = useState(false);
  const [delTarget, setDelTarget]     = useState(null);
  const [driveUrlMap, setDriveUrlMap] = useState({});   // { _clienteId: url }
  const [panelPage, setPanelPage]     = useState(1);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await boGET("/backoffice/panel-asesoras");
      if (r.ok) setData(r.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Resuelve Drive URLs en background al nivel de solicitud (Clientes → cliente → paquete)
  useEffect(() => {
    const allClients = SVC_KEYS.flatMap(s => data[s] || []);
    const toResolve = allClients.filter(c => c._id && !driveUrlMap[c._id]);
    toResolve.forEach(c => {
      boGET(`/backoffice/panel-asesoras/${c._id}/drive-folder-url`)
        .then(r => { if (r.ok && r.url) setDriveUrlMap(prev => ({ ...prev, [c._id]: r.url })); })
        .catch(() => {});
    });
  }, [data]);

  /* ── Lista visible ── */
  const allItems = curTab === "all"
    ? SVC_KEYS.flatMap(s => (data[s] || []).map(c => ({ ...c, _svc: s })))
    : (data[curTab] || []).map(c => ({ ...c, _svc: curTab }));

  const visible = allItems
    .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !filterEstado || c.estado === filterEstado);

  const totalPages  = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage    = Math.min(panelPage, totalPages);
  const pageVisible = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page cuando cambia la búsqueda o filtro
  useEffect(() => { setPanelPage(1); }, [search, filterEstado, curTab]);

  /* ── Contadores ── */
  const total     = SVC_KEYS.reduce((a,s) => a + (data[s]?.length || 0), 0);
  const tabCounts = { all: total, ...Object.fromEntries(SVC_KEYS.map(s => [s, data[s]?.length || 0])) };
  const act       = visible.filter(c => c.estado === "ACTIVO").length;
  const noact     = visible.filter(c => c.estado === "NO_ACTIVO").length;
  const activar   = visible.filter(c => c.estado === "ACTIVAR").length;
  const pend      = visible.filter(c => c.pending?.length > 0).length;

  /* ── Acciones ── */
  async function handleDelete() {
    if (!delTarget) return;
    setSaving(true);
    try {
      await boDELETE(`/backoffice/panel-asesoras/${delTarget.id}`);
      setDelTarget(null);
      setExpandedKey(null);
      await load();
    } finally { setSaving(false); }
  }

  async function handleSaveEdit(body) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/panel-asesoras/${editTarget.item._id}`, body);
      if (r.ok) { setEditTarget(null); await load(); }
      else alert(r.msg || "Error al guardar");
    } finally { setSaving(false); }
  }

  async function handleSaveNew(body) {
    setSaving(true);
    try {
      const r = await boPOST("/backoffice/panel-asesoras", { ...body, panel_servicio: addSvc });
      if (r.ok) { setAddMode(false); setCurTab(addSvc); await load(); }
      else alert(r.msg || "Error al crear");
    } finally { setSaving(false); }
  }

  const keyFor = c => `${c._id}_${c._svc}`;

  /* ─── Render ─── */
  return (
    <div className="p-4 sm:p-5 max-w-4xl mx-auto space-y-3 w-full overflow-x-hidden">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-neutral-800">Panel asesoras — Inspira Legal</h1>
        <div className="flex gap-2">
          <button onClick={() => exportJSON(data)}
            className="px-3 py-1.5 text-xs rounded-lg border border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors">
            Exportar JSON
          </button>
          <button onClick={() => { setAddMode(true); setEditTarget(null); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-green-400 bg-green-50 text-green-800 font-semibold hover:bg-green-100 transition-colors">
            + Agregar cliente
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setCurTab(t.id); setExpandedKey(null); }}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              curTab === t.id
                ? "bg-neutral-200 border-neutral-400 text-neutral-800 font-semibold"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
            }`}>
            {t.label} <span className="opacity-60">{tabCounts[t.id]}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[["Total",visible.length],["Activos",act],["No activos",noact],["Por activar",activar],["Con pendientes",pend]].map(([l,n]) => (
          <div key={l} className="bg-white border border-neutral-200 rounded-lg p-2.5">
            <div className="text-[10px] text-neutral-400 mb-0.5">{l}</div>
            <div className="text-xl font-semibold text-neutral-800">{n}</div>
          </div>
        ))}
      </div>

      {/* Búsqueda + filtro */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text" placeholder="Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] border border-neutral-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="border border-neutral-300 rounded-lg px-2 py-1.5 text-xs bg-white text-neutral-700">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
        </select>
      </div>

      {/* Modal agregar */}
      {addMode && (
        <ModalWrapper title="Nuevo cliente"
          onCancel={() => setAddMode(false)}
          header={
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SVC_KEYS.map(s => (
                <button key={s} onClick={() => setAddSvc(s)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    addSvc === s ? "border-green-400 bg-green-50 text-green-800 font-semibold" : "border-neutral-200 text-neutral-600"
                  }`}>
                  {SVC_LABELS[s]}
                </button>
              ))}
            </div>
          }>
          <ClienteForm
            key={addSvc}
            item={null}
            svc={addSvc}
            saving={saving}
            onSubmit={handleSaveNew}
            onCancel={() => setAddMode(false)}
          />
        </ModalWrapper>
      )}

      {/* Modal editar */}
      {editTarget && (
        <ModalWrapper title={`Editar: ${editTarget.item.name}`}
          onCancel={() => setEditTarget(null)}>
          <ClienteForm
            item={editTarget.item}
            svc={editTarget.svc}
            saving={saving}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditTarget(null)}
          />
        </ModalWrapper>
      )}

      {/* Confirmación eliminar */}
      {delTarget && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
          <span className="flex-1 text-sm text-red-800">
            ¿Quitar a <b>{delTarget.name}</b> del panel? (la solicitud no se elimina)
          </span>
          <button onClick={() => setDelTarget(null)} className="px-3 py-1 text-xs border border-neutral-300 rounded bg-white hover:bg-neutral-50">Cancelar</button>
          <button onClick={handleDelete} disabled={saving}
            className="px-3 py-1 text-xs rounded bg-red-700 text-white font-semibold disabled:opacity-50 hover:bg-red-800">
            {saving ? "…" : "Sí, quitar"}
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center text-sm text-neutral-400 py-10">Cargando…</div>
      ) : visible.length === 0 ? (
        <div className="text-center text-sm text-neutral-400 py-10">Sin resultados</div>
      ) : (
        <>
          {/* Paginador — arriba */}
          {totalPages > 1 && <Paginator safePage={safePage} totalPages={totalPages} total={visible.length} onChange={setPanelPage} />}

          <div className="flex flex-col gap-2">
            {pageVisible.map(c => {
              const key = keyFor(c);
              const enriched = { ...c, driveUrl: driveUrlMap[c._id] || "" };
              return (
                <ClienteCard
                  key={key}
                  c={enriched}
                  isExp={expandedKey === key}
                  onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
                  onEdit={(item) => { setEditTarget({ item, svc: item._svc }); setAddMode(false); }}
                  onDelete={() => setDelTarget({ id: c._id, svc: c._svc, name: c.name })}
                />
              );
            })}
          </div>

          {/* Paginador — abajo */}
          {totalPages > 1 && <Paginator safePage={safePage} totalPages={totalPages} total={visible.length} onChange={setPanelPage} />}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGINATOR
═══════════════════════════════════════════════════════════════════════════ */
function Paginator({ safePage, totalPages, total, onChange }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 px-1">
      <span className="text-xs text-neutral-400">
        Pág. {safePage}/{totalPages} · {total} cliente{total !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onChange(p => Math.max(1, p - 1))}
          disabled={safePage <= 1}
          className="px-3 py-1 text-xs border border-neutral-200 rounded-lg disabled:opacity-30 hover:bg-neutral-50 transition">
          ← Ant.
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 text-xs rounded-lg border transition ${
              p === safePage
                ? "bg-[#023A4B] text-white border-[#023A4B] font-semibold"
                : "border-neutral-200 hover:bg-neutral-50"
            }`}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(p => Math.min(totalPages, p + 1))}
          disabled={safePage >= totalPages}
          className="px-3 py-1 text-xs border border-neutral-200 rounded-lg disabled:opacity-30 hover:bg-neutral-50 transition">
          Sig. →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
function ModalWrapper({ title, onCancel, header, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-md p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm text-neutral-800">{title}</h3>
          {header}
        </div>
        <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none mt-0.5">✕</button>
      </div>
      <div className="border-t border-neutral-100 pt-3">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE CARD
═══════════════════════════════════════════════════════════════════════════ */
function ClienteCard({ c, isExp, onToggle, onEdit, onDelete }) {
  const svc = c._svc;
  const colors = SVC_COLORS[svc] || SVC_COLORS.master;
  const hasBeca = c.beca?.aprobable;
  const hasPend = c.pending?.length > 0;

  let subtitle = `${SVC_LABELS[svc]} · ${c.paquete || "Sin paquete"}`;
  if ((svc === "visa" || svc === "ee") && c.fases) {
    const lastDone = [...(c.fases)].reverse().find(f => f.done);
    subtitle += lastDone ? ` · ${lastDone.label}` : " · Sin iniciar";
  }
  if (c.promedio) subtitle += ` · Prom: ${c.promedio}`;

  return (
    <div className={`bg-white rounded-lg overflow-hidden border ${
      c.portalLinked ? "border-l-[3px] border-l-violet-500 border-r border-t border-b border-neutral-200" : "border-neutral-200"
    }`}>
      {/* Fila cabecera */}
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-neutral-50 select-none"
        onClick={onToggle}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: colors.bg, color: colors.text }}>
          {ini(c.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5 flex-wrap">
            <span className="truncate">{c.name}</span>
            {c.portalLinked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 border border-violet-200">portal</span>}
            {hasBeca && <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">🎓 beca</span>}
          </div>
          <div className="text-xs text-neutral-400 truncate mt-0.5">{subtitle}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${estadoBadgeCls(c.estado)}`}>
            {estadoLabel(c.estado)}
          </span>
          {hasPend && (
            <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {c.pending.length}
            </span>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit(c); }}
            className="px-2 py-0.5 text-[11px] rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100">
            Editar
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="px-2 py-0.5 text-[11px] rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
            Eliminar
          </button>
          <span className={`text-neutral-300 text-xs transition-transform duration-150 ml-1 ${isExp ? "rotate-180" : ""}`}>▼</span>
        </div>
      </div>

      {/* Detalle expandido */}
      {isExp && <ClienteDetail c={c} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE DETAIL (vista expandida)
═══════════════════════════════════════════════════════════════════════════ */
function ClienteDetail({ c }) {
  const svc = c._svc;
  return (
    <div className="border-t border-neutral-100 px-4 py-3 space-y-4 text-xs">
      {svc === "master"           && <MasterDetail c={c} />}
      {(svc === "visa" || svc === "ee") && <VisaEeDetail c={c} />}
      {svc === "fp"               && <FpDetail c={c} />}
      {svc === "legal"            && <LegalDetail c={c} />}
      <PagosSection pagos={c.pagos} />
      {c.pending?.length > 0 && (
        <div>
          <SectionTitle>Pendientes generales</SectionTitle>
          <ul className="space-y-1 mt-1">
            {c.pending.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide border-b border-neutral-100 pb-1 mb-2">{children}</div>;
}

function FieldGrid({ fields }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {fields.map(([label, value, isMiss]) => (
        <div key={label}>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</div>
          <div className={`text-xs mt-0.5 ${isMiss ? "text-red-500 italic" : "text-neutral-700"}`}>{fv(value)}</div>
        </div>
      ))}
    </div>
  );
}

function DriveIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

function CarpetaLinks({ c }) {
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {c.driveUrl ? (
        <a
          href={c.driveUrl}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 text-[11px] font-medium text-neutral-600 group-hover:text-neutral-900"
        >
          <DriveIcon size={13} />
          <span className="group-hover:text-neutral-900 transition-colors">Drive ↗</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-100 bg-neutral-50 text-[11px] text-neutral-300 cursor-default select-none">
          <DriveIcon size={13} />
          <span>Drive</span>
        </span>
      )}
    </div>
  );
}

function MasterDetail({ c }) {
  const p = c.pasos || {};
  const steps = [
    ["Fichero", p.fichero], ["Nota media", c.notaMedia], ["CV Europass", c.cvEuropass],
    ["Informe búsqueda", p.informe], ["Escogió máster", p.escogio],
    ["Docs completos", c.docCompletos], ["Postulación completa", p.postulacion],
  ];
  return (
    <>
      <div>
        <SectionTitle>Datos generales</SectionTitle>
        <FieldGrid fields={[
          ["Paquete", c.paquete],
          ["Carpeta", c.carpeta],
          ...(c.promedio    ? [["Promedio ponderado", c.promedio]] : []),
          ...(c.uni_origen  ? [["Uni origen", c.uni_origen]] : []),
          ...(c.interes     ? [["Área de interés", c.interes]] : []),
          ...(c.masterElegido ? [["Máster elegido", c.masterElegido]] : []),
        ]} />
        <CarpetaLinks c={c} />
      </div>

      {c.beca && (
        <div className={`rounded-lg p-2.5 ${c.beca.aprobable ? "bg-fuchsia-50 border border-fuchsia-200" : "bg-neutral-50 border border-neutral-100"}`}>
          <div className={`text-xs font-semibold ${c.beca.aprobable ? "text-fuchsia-700" : "text-neutral-400"}`}>
            {c.beca.aprobable ? "🎓 Beca aprobable — análisis previo realizado" : "Beca: sin análisis aprobable registrado"}
          </div>
          {c.beca.detalle && <div className="text-xs text-neutral-600 mt-0.5">{c.beca.detalle}</div>}
        </div>
      )}

      <div>
        <SectionTitle>Proceso</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {steps.map(([l, ok]) => (
            <span key={l} className={`px-2 py-0.5 rounded-full text-[10px] border ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>{l}</span>
          ))}
        </div>
      </div>

      {c.unis?.length > 0 && (
        <div>
          <SectionTitle>Postulaciones por universidad</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-[10px] text-neutral-400 border-b border-neutral-100">
                  <th className="text-left py-1 pr-3 font-semibold">Universidad</th>
                  <th className="text-left py-1 pr-3 font-semibold">Máster</th>
                  <th className="text-left py-1 pr-3 font-semibold">F. postulación</th>
                  <th className="text-left py-1 pr-3 font-semibold">F. resultados</th>
                  <th className="text-left py-1 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {c.unis.map((u, i) => (
                  <tr key={u._idAcceso || i} className="border-b border-neutral-50">
                    <td className="py-1 pr-3 font-medium">{u.u}</td>
                    <td className="py-1 pr-3 text-neutral-400">{u.master || "—"}</td>
                    <td className="py-1 pr-3 text-neutral-500">{u.fPost || "—"}</td>
                    <td className="py-1 pr-3 text-neutral-500">{u.fResult || "—"}</td>
                    <td className={`py-1 ${uniEstCls(u.est)}`}>{u.est}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function FasesSection({ fases }) {
  const nextUndone = fases.findIndex(f => !f.done);
  return (
    <div className="space-y-1">
      {fases.map((f, i) => {
        const isCurrent = i === nextUndone;
        return (
          <div key={i} className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border ${
            f.done ? "bg-green-50 border-green-200" : isCurrent ? "bg-amber-50 border-amber-200" : "bg-neutral-50 border-neutral-100"
          }`}>
            <span className="text-sm mt-0.5 flex-shrink-0">{f.done ? "✅" : isCurrent ? "🔶" : "⬜"}</span>
            <div className="flex-1">
              <div className="text-xs font-semibold">{f.label}</div>
              {f.pendiente ? <div className="text-[10px] text-red-600 italic mt-0.5">⚠ {f.pendiente}</div>
                : f.done ? <div className="text-[10px] text-green-600 mt-0.5">Completada</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisaEeDetail({ c }) {
  const svc = c._svc;
  const isVisa = svc === "visa";
  return (
    <>
      <div>
        <SectionTitle>Fases del proceso</SectionTitle>
        <FasesSection fases={c.fases || mkFases()} />
      </div>
      <div>
        <SectionTitle>Datos de {isVisa ? "visa" : "estancia"}</SectionTitle>
        {isVisa ? (
          <FieldGrid fields={[
            ["Fecha cita consulado", c.fechaCita, miss(c.fechaCita)],
            ["Carpeta", c.carpeta],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte)],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie)],
            ["Nº expediente", c.expediente, miss(c.expediente)],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
          ]} />
        ) : (
          <FieldGrid fields={[
            ["Detalle", c.detalle],
            ["Carpeta", c.carpeta],
            ["Llegada a España", c.llegada, miss(c.llegada)],
            ["Plazo máximo", c.plazoMax, miss(c.plazoMax)],
            ["Plazo ideal", c.plazoIdeal, miss(c.plazoIdeal)],
            ["Pasaporte", c.pasaporte, miss(c.pasaporte)],
            ["Fecha nacimiento", c.fNac, miss(c.fNac)],
            ["NIE", c.nie, miss(c.nie)],
            ["Nº expediente", c.expediente, miss(c.expediente)],
            ["F. presentación", c.fPresentacion, miss(c.fPresentacion)],
          ]} />
        )}
        <CarpetaLinks c={c} />
      </div>
    </>
  );
}

function FpDetail({ c }) {
  return (
    <div>
      <SectionTitle>FP / Grado</SectionTitle>
      <FieldGrid fields={[
        ["Paquete", c.paquete], ["Carpeta", c.carpeta],
        ["Centro", c.centro],  ["Estado admisión", c.estadoAdm],
        ["NIE", c.nie, miss(c.nie)], ["Nº expediente", c.expediente, miss(c.expediente)],
      ]} />
      <CarpetaLinks c={c} />
    </div>
  );
}

function LegalDetail({ c }) {
  return (
    <div>
      <SectionTitle>Legal / Extranjería</SectionTitle>
      <FieldGrid fields={[
        ["Tipo", c.tipo], ["Resultado", c.resultado],
        ["Asesor", c.asesor], ["Carpeta", c.carpeta],
        ["NIE", c.nie, miss(c.nie)], ["Nº expediente", c.expediente, miss(c.expediente)],
        ["Fecha resolución", c.resolucion, miss(c.resolucion)], ["Paquete", c.paquete],
      ]} />
      <CarpetaLinks c={c} />
    </div>
  );
}

function PagosSection({ pagos }) {
  const p = pagos || mkPagos();
  const pct = p.total ? Math.min(100, Math.round((parseFloat(p.pagadas)||0) / parseFloat(p.total) * 100)) : 0;
  return (
    <div>
      <SectionTitle>Pagos</SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[["Tipo", p.tipo], ["Total (€)", p.total], ["Cuotas", p.cuotas]].map(([l,v]) => (
          <div key={l}>
            <div className="text-[10px] text-neutral-400">{l}</div>
            <div className="text-xs text-neutral-700">{fv(v)}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-400 min-w-[68px]">Pagado: {fv(p.pagadas)}</span>
        <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[10px] min-w-[78px] text-right ${miss(p.pendiente) ? "text-red-500" : "text-green-700"}`}>
          Pendiente: {fv(p.pendiente)}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE FORM (compartido para crear y editar)
═══════════════════════════════════════════════════════════════════════════ */
function buildInitialForm(item) {
  return {
    name:         item?.name         || "",
    email:        "",
    estado:       item?.estado       || "ACTIVO",
    paquete:      item?.paquete      || "",
    carpeta:      item?.carpeta      || "",
    driveUrl:     item?.driveUrl     || "",
    portalUrl:    item?.portalUrl    || "",
    promedio:     item?.promedio     || "",
    interes:      item?.interes      || "",
    uni_origen:   item?.uni_origen   || "",
    masterElegido:item?.masterElegido|| "",
    portalLinked: item?.portalLinked || false,
    beca_aprobable: item?.beca?.aprobable || false,
    beca_detalle:   item?.beca?.detalle   || "",
    notaMedia:  item?.notaMedia  || false,
    cvEuropass: item?.cvEuropass || false,
    docCompletos: item?.docCompletos || false,
    fichero:    item?.pasos?.fichero    || false,
    informe:    item?.pasos?.informe    || false,
    escogio:    item?.pasos?.escogio    || false,
    postulacion:item?.pasos?.postulacion || false,
    fechaCita:  item?.fechaCita  || "",
    pasaporte:  item?.pasaporte  || "",
    fNac:       item?.fNac       || "",
    nie:        item?.nie        || "",
    expediente: item?.expediente || "",
    llegada:    item?.llegada    || "",
    plazoMax:   item?.plazoMax   || "",
    plazoIdeal: item?.plazoIdeal || "",
    detalle:    item?.detalle    || "",
    fPresentacion: item?.fPresentacion || "",
    centro:     item?.centro     || "",
    estadoAdm:  item?.estadoAdm  || "",
    resultado:  item?.resultado  || "",
    tipo:       item?.tipo       || "",
    asesor:     item?.asesor     || "",
    resolucion: item?.resolucion || "",
  };
}

function ClienteForm({ item, svc, saving, onSubmit, onCancel }) {
  const isEdit = !!item;
  const [form, setForm]         = useState(() => buildInitialForm(item));
  const [unis, setUnis]         = useState(() => item?.unis ? JSON.parse(JSON.stringify(item.unis)) : []);
  const [fases, setFases]       = useState(() => item?.fases ? JSON.parse(JSON.stringify(item.fases)) : mkFases());
  const [pendingStr, setPendingStr] = useState(() => (item?.pending || []).join("\n"));
  const resolvedDriveUrl = item?.driveUrl || "";

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setFase(i, field, val) { setFases(f => f.map((x, idx) => idx === i ? { ...x, [field]: val } : x)); }
  function setUniField(i, k, v)  { setUnis(u => u.map((x, idx) => idx === i ? { ...x, [k]: v } : x)); }
  function remUni(i) { setUnis(u => u.filter((_, idx) => idx !== i)); }

  async function handleSubmit() {
    if (!form.name?.trim()) { alert("El nombre es obligatorio"); return; }

    // Para maestrías en modo edición, primero guardamos unis modificadas
    if (isEdit && svc === "master") {
      const promises = unis
        .filter(u => u._idAcceso)
        .map(u => boPATCH(`/backoffice/panel-asesoras/portales/${u._idAcceso}`, {
          u: u.u, master: u.master, fPost: u.fPost, fResult: u.fResult, est: u.est,
        }));
      await Promise.all(promises);
    }

    const body = {
      name: form.name.trim(),
      ...(!isEdit && { email: form.email || undefined }),
      estado: form.estado, paquete: form.paquete,
      pending: pendingStr.split("\n").map(s => s.trim()).filter(Boolean),
      promedio: form.promedio, interes: form.interes,
      uni_origen: form.uni_origen, masterElegido: form.masterElegido,
      portalLinked: form.portalLinked,
      notaMedia: form.notaMedia, cvEuropass: form.cvEuropass, docCompletos: form.docCompletos,
      pasos: { fichero: form.fichero, informe: form.informe, escogio: form.escogio, postulacion: form.postulacion },
      beca: { aprobable: form.beca_aprobable, detalle: form.beca_detalle },
      fases,
      fechaCita: form.fechaCita, pasaporte: form.pasaporte, fNac: form.fNac,
      nie: form.nie, expediente: form.expediente, llegada: form.llegada,
      plazoMax: form.plazoMax, plazoIdeal: form.plazoIdeal,
      detalle: form.detalle, fPresentacion: form.fPresentacion,
      carpeta: form.carpeta, centro: form.centro, estadoAdm: form.estadoAdm,
      resultado: form.resultado, tipo: form.tipo, asesor: form.asesor, resolucion: form.resolucion,
    };

    await onSubmit(body);
  }

  const inp = "w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";
  const lab = "block text-[10px] text-neutral-400 uppercase tracking-wide mb-0.5";

  return (
    <div className="space-y-4 text-xs">

      {/* Campos básicos */}
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 sm:col-span-1">
          <span className={lab}>Nombre completo *</span>
          <input className={inp} value={form.name} onChange={e => set("name", e.target.value)} />
        </label>
        {!isEdit && (
          <label>
            <span className={lab}>Email (opcional)</span>
            <input className={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </label>
        )}
        <label>
          <span className={lab}>Estado</span>
          <select className={inp} value={form.estado} onChange={e => set("estado", e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
          </select>
        </label>
        <label className={!isEdit ? "col-span-2 sm:col-span-1" : ""}>
          <span className={lab}>Paquete contratado</span>
          <input className={inp} value={form.paquete} onChange={e => set("paquete", e.target.value)} />
        </label>
      </div>

      {/* Carpeta + Drive (solo lectura) */}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={lab}>Código carpeta</span>
          <input className={inp} value={form.carpeta} onChange={e => set("carpeta", e.target.value)} />
        </label>
        <div>
          <span className={lab}>Carpeta Drive</span>
          {resolvedDriveUrl ? (
            <a href={resolvedDriveUrl} target="_blank" rel="noreferrer"
              className="group inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 text-[11px] font-medium text-neutral-600">
              <DriveIcon size={13} />
              <span>Abrir en Drive ↗</span>
            </a>
          ) : (
            <span className="block mt-1 text-xs text-neutral-400 italic">Sin carpeta asignada</span>
          )}
        </div>
      </div>

      {/* ── MÁSTER ── */}
      {svc === "master" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <label>
              <span className={lab}>Área de interés</span>
              <input className={inp} value={form.interes} onChange={e => set("interes", e.target.value)} />
            </label>
            <label>
              <span className={lab}>Uni de origen</span>
              <input className={inp} value={form.uni_origen} onChange={e => set("uni_origen", e.target.value)} />
            </label>
            <label>
              <span className={lab}>Promedio ponderado</span>
              <input className={inp} value={form.promedio} onChange={e => set("promedio", e.target.value)} placeholder="ej: 15.67" />
            </label>
          </div>
          <label>
            <span className={lab}>Máster elegido</span>
            <input className={inp} value={form.masterElegido} onChange={e => set("masterElegido", e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={lab}>¿Beca aprobable?</span>
              <select className={inp} value={form.beca_aprobable ? "1" : "0"} onChange={e => set("beca_aprobable", e.target.value === "1")}>
                <option value="0">No / Sin análisis</option>
                <option value="1">Sí — perfil aprobable</option>
              </select>
            </label>
            <label>
              <span className={lab}>Detalle análisis beca</span>
              <input className={inp} value={form.beca_detalle} onChange={e => set("beca_detalle", e.target.value)} />
            </label>
          </div>
          <div>
            <div className={lab}>Proceso</div>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {[
                ["fichero","Fichero"], ["notaMedia","Nota media"], ["cvEuropass","CV Europass"],
                ["informe","Informe búsqueda"], ["escogio","Escogió máster"],
                ["docCompletos","Docs completos"], ["postulacion","Postulación completa"],
              ].map(([k,l]) => (
                <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} className="w-3.5 h-3.5" />
                  <span>{l}</span>
                </label>
              ))}
            </div>
          </div>
          {isEdit && (
            <UnisEditor
              unis={unis}
              solicitudId={item._id}
              onAddLocal={u => setUnis(prev => [...prev, u])}
              onRem={remUni}
              onSet={setUniField}
            />
          )}
        </>
      )}

      {/* ── VISA / ESTANCIA ── */}
      {(svc === "visa" || svc === "ee") && (
        <>
          <div>
            <div className={lab}>Fases del proceso</div>
            <div className="mt-1.5 border border-neutral-100 rounded-lg overflow-hidden divide-y divide-neutral-100">
              {fases.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 px-2.5 py-2">
                  <input type="checkbox" checked={f.done} onChange={e => setFase(i, "done", e.target.checked)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="min-w-[160px] font-medium pt-0.5 flex-shrink-0">{f.label}</span>
                  <input className={`${inp} flex-1`} value={f.pendiente} onChange={e => setFase(i, "pendiente", e.target.value)} placeholder="pendiente específico…" />
                </div>
              ))}
            </div>
          </div>
          {svc === "visa" ? (
            <div className="grid grid-cols-2 gap-3">
              {[["fechaCita","Fecha cita consulado"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className={lab}>Detalle del caso</span><input className={inp} value={form.detalle} onChange={e => set("detalle", e.target.value)} /></label>
              {[["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["fPresentacion","Fecha presentación"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FP ── */}
      {svc === "fp" && (
        <div className="grid grid-cols-2 gap-3">
          {[["centro","Centro"],["estadoAdm","Estado admisión"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* ── LEGAL ── */}
      {svc === "legal" && (
        <div className="grid grid-cols-2 gap-3">
          {[["tipo","Tipo procedimiento"],["resultado","Resultado"],["asesor","Asesor"],["resolucion","Fecha resolución"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* Pendientes */}
      <label>
        <span className={lab}>Pendientes generales (uno por línea)</span>
        <textarea className={`${inp} min-h-[56px] resize-y`} value={pendingStr} onChange={e => setPendingStr(e.target.value)} />
      </label>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <button onClick={onCancel} type="button"
          className="px-4 py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving} type="button"
          className="px-4 py-1.5 text-xs rounded-lg bg-primary text-white font-semibold disabled:opacity-50 hover:opacity-90">
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UNIS EDITOR — edición en tiempo real de postulaciones de máster
═══════════════════════════════════════════════════════════════════════════ */
function UnisEditor({ unis, solicitudId, onAddLocal, onRem, onSet }) {
  const [busy, setBusy] = useState(false);

  async function addUni() {
    setBusy(true);
    try {
      const r = await boPOST(`/backoffice/panel-asesoras/${solicitudId}/portales`, { u: "Nueva universidad", est: "PENDIENTE" });
      if (r.ok) {
        onAddLocal({ _idAcceso: r._idAcceso, u: "Nueva universidad", master: "", fPost: "", fResult: "", est: "PENDIENTE" });
      }
    } finally { setBusy(false); }
  }

  async function deleteUni(uni, i) {
    if (uni._idAcceso) {
      setBusy(true);
      try {
        await boDELETE(`/backoffice/panel-asesoras/portales/${uni._idAcceso}`);
        onRem(i);
      } finally { setBusy(false); }
    } else {
      onRem(i);
    }
  }

  const inp = "w-full border border-neutral-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";

  return (
    <div>
      <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1.5">
        Universidades <span className="font-normal normal-case text-neutral-300">(agregar/eliminar se aplica al instante)</span>
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-neutral-50">
            <tr className="text-[10px] text-neutral-400">
              {["Universidad","Máster específico","F. postulación","F. resultados","Estado",""].map(h => (
                <th key={h} className="text-left px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unis.map((u, i) => (
              <tr key={u._idAcceso || i} className="border-t border-neutral-100">
                <td className="px-2 py-1"><input className={inp} value={u.u} onChange={e => onSet(i,"u",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.master} onChange={e => onSet(i,"master",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fPost} onChange={e => onSet(i,"fPost",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fResult} onChange={e => onSet(i,"fResult",e.target.value)} /></td>
                <td className="px-2 py-1">
                  <select className={inp} value={u.est} onChange={e => onSet(i,"est",e.target.value)}>
                    {UNI_EST.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <button onClick={() => deleteUni(u, i)} disabled={busy}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-2 py-1.5 border-t border-neutral-100">
          <button onClick={addUni} disabled={busy}
            className="text-[11px] text-neutral-500 hover:text-neutral-700 disabled:opacity-40">
            {busy ? "…" : "+ agregar universidad"}
          </button>
        </div>
      </div>
    </div>
  );
}
