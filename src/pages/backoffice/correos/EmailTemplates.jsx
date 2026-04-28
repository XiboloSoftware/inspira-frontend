// src/pages/backoffice/correos/EmailTemplates.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import EmailEditor from "react-email-editor";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const TIPO_META = {
  bienvenida:   { label: "Bienvenida",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  recordatorio: { label: "Recordatorio",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  notificacion: { label: "Notificación",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  documento:    { label: "Documento",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  otro:         { label: "Otro",          color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

// Merge tags de Unlayer — el valor {{x}} es lo que se inserta en el HTML exportado
const MERGE_TAGS = {
  nombre: { name: "Nombre del cliente",     value: "{{nombre}}", sample: "Juan García" },
  email:  { name: "Correo del cliente",     value: "{{email}}",  sample: "juan@ejemplo.com" },
  fecha:  { name: "Fecha actual",           value: "{{fecha}}",  sample: "27 de abril de 2026" },
};

// ── Chip de tipo ──────────────────────────────────────────────────────────────
function TipoBadge({ tipo }) {
  const m = TIPO_META[tipo] || TIPO_META.otro;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}

// ── Card de template ──────────────────────────────────────────────────────────
function TemplateCard({ t, onEditar, onEliminar, onActivar, onDesactivar }) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all
      ${t.activo ? "border-emerald-300 ring-1 ring-emerald-200" : "border-neutral-200"}`}>
      <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2
        ${t.activo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-50 text-neutral-400"}`}>
        <span className={`w-2 h-2 rounded-full inline-block ${t.activo ? "bg-emerald-500" : "bg-neutral-300"}`} />
        {t.activo ? "ACTIVO — se usa al enviar correos de este tipo" : "Inactivo"}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <TipoBadge tipo={t.tipo} />
          {t.design_json
            ? <span className="text-[10px] text-emerald-600 font-medium">✓ Editor visual</span>
            : <span className="text-[10px] text-neutral-400">HTML heredado</span>}
        </div>
        <p className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">{t.nombre}</p>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{t.asunto}</p>
        <p className="text-[11px] text-neutral-400 mt-2">
          {new Date(t.fecha_actualizacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <button onClick={() => onEditar(t)}
          className="flex-1 text-xs px-3 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 transition-colors font-medium">
          Editar
        </button>
        {t.activo
          ? <button onClick={() => onDesactivar(t)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-300 text-neutral-500 hover:bg-neutral-50 transition-colors font-medium">
              Desactivar
            </button>
          : <button onClick={() => onActivar(t)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition-colors font-medium">
              Activar
            </button>
        }
        {!t.activo && (
          <button onClick={() => onEliminar(t)}
            className="text-xs px-3 py-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4a1 1 0 011 1v3H9V4a1 1 0 011-1z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Modal editor ─────────────────────────────────────────────────────────────
// Tab "visual": Unlayer drag & drop (para templates nuevos o con design_json)
// Tab "html": textarea de HTML directo (para templates heredados o avanzados)
const TOPBAR_H = 56; // px
const TABBAR_H = 40; // px
const EDITOR_H = `calc(100vh - ${TOPBAR_H + TABBAR_H}px)`;

function VisualEditorModal({ template, tipos, assets, onGuardar, onCerrar }) {
  const editorRef  = useRef(null);
  const taRef      = useRef(null);
  const isNew      = !template;

  // Default: visual si tiene design_json, html si es heredado o nuevo
  const [tab, setTab]             = useState(template?.design_json ? "visual" : "html");
  const [htmlContent, setHtml]    = useState(template?.html || "");
  const [editorListo, setListo]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testNombre, setTestNom]  = useState("Cliente Ejemplo");
  const [testLoading, setTestL]   = useState(false);
  const [testMsg, setTestMsg]     = useState(null);
  const [form, setForm]           = useState({
    nombre: template?.nombre || "",
    tipo:   template?.tipo   || "bienvenida",
    asunto: template?.asunto || "",
  });
  const [error, setError] = useState("");

  const onReady = useCallback(() => {
    setListo(true);
    if (template?.design_json) {
      try { editorRef.current.loadDesign(JSON.parse(template.design_json)); }
      catch (e) { console.error("Error cargando diseño:", e); }
    }
  }, [template]);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onCerrar]);

  // Insertar variable en el cursor del textarea HTML
  function insertarVariable(v) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e2 = ta.selectionEnd;
    const next = htmlContent.slice(0, s) + v + htmlContent.slice(e2);
    setHtml(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + v.length, s + v.length); }, 0);
  }

  const guardar = () => {
    if (!form.nombre.trim() || !form.asunto.trim()) { setError("Nombre y Asunto son obligatorios"); return; }
    setError("");

    if (tab === "html") {
      if (!htmlContent.trim()) { setError("El HTML no puede estar vacío"); return; }
      onGuardar({ ...form, html: htmlContent, design_json: null });
      return;
    }

    // Tab visual → exportar de Unlayer
    setSaving(true);
    editorRef.current.exportHtml(({ design, html }) => {
      onGuardar({ ...form, html, design_json: JSON.stringify(design) });
      setSaving(false);
    });
  };

  const enviarPrueba = async () => {
    if (!template?.id_template || !testEmail) { setTestMsg({ tipo: "error", msg: "Ingresa un email de destino" }); return; }
    setTestL(true); setTestMsg(null);
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${template.id_template}/enviar-prueba`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: testEmail, nombre: testNombre }),
    }).then(x => x.json());
    setTestL(false);
    setTestMsg({ tipo: r.ok ? "ok" : "error", msg: r.msg });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#f5f5f5" }}>

      {/* ── Barra superior (56px) ── */}
      <div className="bg-white border-b border-neutral-200 px-4 flex items-center gap-3 shrink-0 shadow-sm"
        style={{ height: TOPBAR_H }}>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-neutral-900 text-sm truncate">
            {isNew ? "Nuevo template de correo" : `Editando: ${template.nombre}`}
          </p>
        </div>

        {/* Prueba rápida */}
        {template?.id_template && (
          <div className="hidden lg:flex items-center gap-2">
            <input value={testNombre} onChange={e => setTestNom(e.target.value)}
              className="border border-neutral-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none" />
            <input value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email"
              placeholder="correo@prueba.com"
              className="border border-neutral-200 rounded-lg px-2 py-1 text-xs w-44 focus:outline-none" />
            <button onClick={enviarPrueba} disabled={testLoading || !testEmail}
              className="px-3 py-1 text-xs bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 font-medium">
              {testLoading ? "Enviando…" : "📧 Prueba"}
            </button>
            {testMsg && <span className={`text-xs font-medium ${testMsg.tipo === "ok" ? "text-emerald-600" : "text-red-500"}`}>{testMsg.msg}</span>}
          </div>
        )}

        <button onClick={onCerrar}
          className="px-4 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50">
          Cancelar
        </button>
        <button onClick={guardar} disabled={saving || (tab === "visual" && !editorListo)}
          className="px-5 py-1.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
          {saving && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
          {saving ? "Guardando…" : isNew ? "Crear template" : "Guardar cambios"}
        </button>
      </div>

      {/* ── Contenido principal ── */}
      <div className="flex overflow-hidden" style={{ height: `calc(100vh - ${TOPBAR_H}px)` }}>

        {/* Sidebar izquierdo */}
        <div className="w-60 bg-white border-r border-neutral-200 overflow-y-auto shrink-0">
          <div className="p-4 space-y-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600">Nombre interno <span className="text-red-400">*</span></label>
              <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                placeholder="Ej: Bienvenida oficial" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600">Tipo</label>
              <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25">
                {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p className="text-[11px] text-neutral-400">Solo 1 activo por tipo.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-600">Asunto <span className="text-red-400">*</span></label>
              <input value={form.asunto} onChange={e => setForm(f => ({...f, asunto: e.target.value}))}
                className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                placeholder="¡Bienvenido/a a Inspira! 🚀" />
            </div>

            {/* Variables */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1.5">Variables dinámicas</p>
              <div className="space-y-1.5">
                {Object.entries(MERGE_TAGS).map(([k, tag]) => (
                  <button key={k} type="button"
                    onClick={() => tab === "html" ? insertarVariable(`{{${k}}}`) : undefined}
                    title={tab === "html" ? "Insertar en el cursor" : "Variable disponible en Merge Tags del editor"}
                    className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white border border-amber-200 transition-colors
                      ${tab === "html" ? "hover:border-amber-400 cursor-pointer" : "cursor-default"}`}>
                    <code className="text-[11px] text-amber-700 font-mono">{`{{${k}}}`}</code>
                    <span className="text-[11px] text-neutral-500">{tag.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-amber-700 mt-2">
                {tab === "html" ? "Clic → inserta en el cursor" : "En el editor: botón Merge Tags ↗"}
              </p>
            </div>

            {/* Imágenes */}
            {assets.length > 0 && (
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <p className="text-xs font-semibold text-neutral-600 px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                  📎 Imágenes disponibles
                </p>
                <div className="max-h-44 overflow-y-auto p-2 space-y-1">
                  {assets.map(a => (
                    <button key={a.id_asset} type="button"
                      onClick={() => navigator.clipboard.writeText(a.url_publica)}
                      className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-colors">
                      <img src={a.url_publica} alt={a.nombre} className="w-9 h-7 object-cover rounded shrink-0" />
                      <span className="text-[11px] text-neutral-600 truncate text-left">{a.nombre}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 px-3 py-1.5 border-t border-neutral-100">
                  Clic → copia URL · pega en bloque imagen del editor
                </p>
              </div>
            )}

            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}
          </div>
        </div>

        {/* Área del editor */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Tab bar (40px) ── */}
          <div className="bg-white border-b border-neutral-200 px-4 flex items-stretch shrink-0"
            style={{ height: TABBAR_H }}>
            {[
              { key: "visual", label: "🎨 Editor visual", desc: "Drag & drop, sin programación" },
              { key: "html",   label: "📄 Editar HTML",   desc: "Para usuarios avanzados" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} title={t.desc}
                className={`px-5 text-xs font-medium border-b-2 transition-colors
                  ${tab === t.key ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Cuerpo del editor (ocupa todo el resto) ── */}
          <div style={{ height: EDITOR_H, position: "relative" }}>

            {/* Spinner Unlayer */}
            {!editorListo && tab === "visual" && (
              <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-neutral-600 font-medium">Cargando editor visual…</p>
                  <p className="text-xs text-neutral-400 mt-1">La primera carga puede tardar unos segundos</p>
                </div>
              </div>
            )}

            {/* Unlayer — siempre montado, oculto cuando el tab es HTML */}
            <div style={{ height: "100%", display: tab === "visual" ? "block" : "none" }}>
              <EmailEditor
                ref={editorRef}
                onReady={onReady}
                style={{ height: "100%" }}
                options={{
                  displayMode: "email",
                  mergeTags: MERGE_TAGS,
                  features: {
                    stockImages: { enabled: false },
                    userUploads: false,
                    preview: true,
                    imageEditor: false,
                  },
                  appearance: {
                    theme: "light",
                    panels: { tools: { dock: "left" } },
                  },
                }}
              />
            </div>

            {/* Tab HTML */}
            {tab === "html" && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {!template?.design_json && (
                  <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 text-xs text-sky-700 shrink-0">
                    ✏️ Template heredado — edita el HTML directamente o usa <strong>+ Nuevo template</strong> para crear uno visual desde cero.
                  </div>
                )}
                <textarea
                  ref={taRef}
                  value={htmlContent}
                  onChange={e => setHtml(e.target.value)}
                  style={{ flex: 1, resize: "none", fontFamily: "monospace" }}
                  className="w-full p-4 text-xs focus:outline-none bg-neutral-950 text-emerald-400 leading-relaxed"
                  spellCheck={false}
                  placeholder={"<!DOCTYPE html>\n<html lang='es'>\n..."}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null); // null=cerrado | false=nuevo | objeto=editar
  const [toast, setToast] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => { cargar(); cargarTipos(); cargarAssets(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/email-templates");
    if (r.ok) setTemplates(r.templates || []);
    setLoading(false);
  }

  async function cargarTipos() {
    const r = await boGET("/backoffice/email-templates/tipos");
    if (r.ok) setTipos(r.tipos || []);
  }

  async function cargarAssets() {
    const r = await boGET("/backoffice/media");
    if (r.ok) setAssets(r.assets || []);
  }

  async function abrirEditar(t) {
    const r = await boGET(`/backoffice/email-templates/${t.id_template}`);
    if (r.ok) setEditando(r.template);
  }

  async function guardar(payload) {
    const esNuevo = editando === false;
    const r = esNuevo
      ? await boPOST("/backoffice/email-templates", payload)
      : await boPUT(`/backoffice/email-templates/${editando.id_template}`, payload);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    setEditando(null);
    cargar();
    setToast({ tipo: "ok", msg: esNuevo ? "Template creado (inactivo)." : "Template actualizado." });
  }

  async function activar(t) {
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${t.id_template}/activar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then((x) => x.json());
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: `"${t.nombre}" activado. Los demás de tipo "${t.tipo}" fueron desactivados.` });
  }

  async function desactivar(t) {
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${t.id_template}/desactivar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).then((x) => x.json());
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: `Template desactivado.` });
  }

  async function eliminar(t) {
    if (t.activo) { setToast({ tipo: "error", msg: "Desactiva el template antes de eliminarlo." }); return; }
    if (!confirm(`¿Eliminar "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
    const r = await boDELETE(`/backoffice/email-templates/${t.id_template}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: "Template eliminado." });
  }

  const templatesVisibles = filtroTipo === "todos"
    ? templates
    : templates.filter(t => t.tipo === filtroTipo);
  const tiposConTemplates = [...new Set(templates.map(t => t.tipo))];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Templates de correo</h1>
          <p className="text-sm text-neutral-500">Editor visual — sin programación. Solo 1 activo por tipo.</p>
        </div>
        <button onClick={() => setEditando(false)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo template
        </button>
      </div>

      {/* Info */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-xs text-sky-700 flex items-start gap-2">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
        </svg>
        <span>
          Al <strong>activar</strong> un template, todos los demás del mismo tipo se desactivan automáticamente.
          Si <strong>ninguno está activo</strong>, el sistema no envía ese correo automático.
        </span>
      </div>

      {/* Filtros */}
      {tiposConTemplates.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors
              ${filtroTipo === "todos" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
            Todos ({templates.length})
          </button>
          {tiposConTemplates.map(tipo => {
            const m = TIPO_META[tipo] || TIPO_META.otro;
            const count = templates.filter(t => t.tipo === tipo).length;
            return (
              <button key={tipo} onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors
                  ${filtroTipo === tipo ? m.color : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
                {m.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading && <p className="text-sm text-neutral-400 text-center py-10">Cargando templates…</p>}
      {!loading && templates.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
          </svg>
          <p className="text-sm">No hay templates. Crea el primero con el botón de arriba.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesVisibles.map(t => (
          <TemplateCard key={t.id_template} t={t}
            onEditar={abrirEditar} onEliminar={eliminar}
            onActivar={activar} onDesactivar={desactivar} />
        ))}
      </div>

      {/* Editor modal */}
      {editando !== null && (
        <VisualEditorModal
          template={editando || null}
          tipos={tipos}
          assets={assets}
          onGuardar={guardar}
          onCerrar={() => setEditando(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm
          ${toast.tipo === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className="flex-1 leading-snug">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 shrink-0 mt-0.5">✕</button>
        </div>
      )}
    </div>
  );
}
