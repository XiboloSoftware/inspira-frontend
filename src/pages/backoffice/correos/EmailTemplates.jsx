// src/pages/backoffice/correos/EmailTemplates.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const TIPO_META = {
  bienvenida:   { label: "Bienvenida",    color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  recordatorio: { label: "Recordatorio",  color: "bg-sky-100 text-sky-700 border-sky-200" },
  notificacion: { label: "Notificación",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  documento:    { label: "Documento",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  otro:         { label: "Otro",          color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

const VARIABLES = [
  { key: "${nombre}", desc: "Nombre completo del cliente" },
  { key: "${email}",  desc: "Correo electrónico del cliente" },
  { key: "${fecha}",  desc: "Fecha actual (ej: 27 de abril de 2026)" },
];

const FORM_VACIO = { id_template: null, nombre: "", tipo: "bienvenida", asunto: "", html: "" };

// ── Chip de tipo ────────────────────────────────────────────────────────────
function TipoBadge({ tipo }) {
  const m = TIPO_META[tipo] || TIPO_META.otro;
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${m.color}`}>
      {m.label}
    </span>
  );
}

// ── Card de template ─────────────────────────────────────────────────────────
function TemplateCard({ t, onEditar, onEliminar, onActivar, onDesactivar }) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${t.activo ? "border-emerald-300 ring-1 ring-emerald-200" : "border-neutral-200"}`}>
      {/* Banda de estado */}
      <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 ${t.activo ? "bg-emerald-50 text-emerald-700" : "bg-neutral-50 text-neutral-400"}`}>
        <span className={`w-2 h-2 rounded-full inline-block ${t.activo ? "bg-emerald-500" : "bg-neutral-300"}`} />
        {t.activo ? "ACTIVO — se usa al enviar correos de este tipo" : "Inactivo"}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 mb-1">
          <TipoBadge tipo={t.tipo} />
        </div>
        <p className="font-semibold text-neutral-900 text-sm mt-1 leading-snug">{t.nombre}</p>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{t.asunto}</p>
        <p className="text-[11px] text-neutral-400 mt-2">
          {new Date(t.fecha_actualizacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Acciones */}
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
function EditorModal({ form, onChange, onSave, onCancel, saving, assets, tipos }) {
  const iframeRef = useRef(null);
  const textareaRef = useRef(null);
  const [tab, setTab] = useState("editor");
  const [testEmail, setTestEmail] = useState("");
  const [testNombre, setTestNombre] = useState("Cliente Ejemplo");
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg, setTestMsg] = useState(null);

  function updatePreview() {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    let html = form.html
      .replace(/\$\{nombre\}/g, testNombre)
      .replace(/\$\{email\}/g, testEmail || "cliente@email.com")
      .replace(/\$\{fecha\}/g, new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }));
    doc.open(); doc.write(html); doc.close();
  }

  useEffect(() => { if (tab === "preview") updatePreview(); }, [tab, form.html, testNombre, testEmail]);

  function insertVariable(v) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = form.html.slice(0, start) + v + form.html.slice(end);
    onChange("html", newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + v.length, start + v.length); }, 0);
  }

  async function enviarPrueba() {
    if (!form.id_template) return;
    if (!testEmail) { setTestMsg({ tipo: "error", msg: "Ingresa un email de destino" }); return; }
    setTestLoading(true); setTestMsg(null);
    const token = localStorage.getItem("bo_token");
    const r = await fetch(`${API_URL}/backoffice/email-templates/${form.id_template}/enviar-prueba`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: testEmail, nombre: testNombre }),
    }).then((x) => x.json());
    setTestLoading(false);
    setTestMsg({ tipo: r.ok ? "ok" : "error", msg: r.msg });
  }

  const isEditing = !!form.id_template;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[94vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="font-semibold text-neutral-900 text-base">
              {isEditing ? `Editando: ${form.nombre}` : "Nuevo template"}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Usa variables como <code className="bg-neutral-100 px-1 rounded text-neutral-700">{"${nombre}"}</code> en el HTML
            </p>
          </div>
          <button onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-5 border-b border-neutral-100 shrink-0">
          {["editor", "preview"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
              {t === "editor" ? "✏️ Editor" : "👁 Preview"}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden flex">

          {tab === "editor" ? (
            <div className="flex-1 flex gap-4 overflow-hidden p-5">

              {/* Panel izquierdo: metadatos + variables */}
              <div className="w-64 shrink-0 flex flex-col gap-4 overflow-y-auto">
                {/* Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600">Nombre <span className="text-red-400">*</span></label>
                  <input type="text" value={form.nombre}
                    onChange={(e) => onChange("nombre", e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="Ej: Bienvenida oficial" />
                </div>

                {/* Tipo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600">Tipo</label>
                  <select value={form.tipo} onChange={(e) => onChange("tipo", e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25">
                    {tipos.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Solo 1 template activo por tipo. Si ninguno activo → no se envía correo.
                  </p>
                </div>

                {/* Asunto */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600">Asunto <span className="text-red-400">*</span></label>
                  <input type="text" value={form.asunto}
                    onChange={(e) => onChange("asunto", e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="¡Bienvenido/a a Inspira! 🚀" />
                </div>

                {/* Variables disponibles */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Variables disponibles</p>
                  <div className="space-y-1.5">
                    {VARIABLES.map((v) => (
                      <button key={v.key} type="button" onClick={() => insertVariable(v.key)}
                        title={`Insertar ${v.key}`}
                        className="w-full text-left flex flex-col gap-0.5 px-2 py-1.5 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-colors">
                        <code className="text-xs text-amber-700 font-mono">{v.key}</code>
                        <span className="text-[11px] text-neutral-500">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-700 mt-2">Haz clic para insertar en el cursor</p>
                </div>

                {/* Imágenes del media panel */}
                {assets.length > 0 && (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <p className="text-xs font-semibold text-neutral-600 px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                      📎 Imágenes disponibles
                    </p>
                    <div className="max-h-48 overflow-y-auto p-2 space-y-1.5">
                      {assets.map((a) => (
                        <button key={a.id_asset} type="button"
                          onClick={() => { navigator.clipboard.writeText(a.url_publica); }}
                          title="Copiar URL de imagen"
                          className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-colors">
                          <img src={a.url_publica} alt={a.nombre} className="w-10 h-8 object-cover rounded shrink-0" />
                          <span className="text-[11px] text-neutral-600 truncate text-left">{a.nombre}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-400 px-3 py-1.5 border-t border-neutral-100">Clic → copia URL al portapapeles</p>
                  </div>
                )}
              </div>

              {/* Editor HTML */}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <label className="text-xs font-medium text-neutral-600">
                  HTML del correo <span className="text-red-400">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={form.html}
                  onChange={(e) => onChange("html", e.target.value)}
                  className="flex-1 border border-neutral-300 rounded-xl px-3 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none leading-relaxed"
                  spellCheck={false}
                  placeholder="<!DOCTYPE html>&#10;<html lang='es'>&#10;..."
                />
              </div>
            </div>

          ) : (
            <div className="flex-1 flex flex-col gap-3 p-5 overflow-hidden">
              {/* Controles preview */}
              <div className="flex gap-2 items-center flex-wrap shrink-0">
                <input type="text" value={testNombre} onChange={(e) => setTestNombre(e.target.value)}
                  placeholder="Nombre de prueba"
                  className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-primary/25" />
                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Email para enviar prueba"
                  className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-primary/25" />
                {isEditing && (
                  <button onClick={enviarPrueba} disabled={testLoading}
                    className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5">
                    {testLoading
                      ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Enviando…</>
                      : "📧 Enviar prueba"
                    }
                  </button>
                )}
                {testMsg && (
                  <span className={`text-xs font-medium ${testMsg.tipo === "ok" ? "text-emerald-600" : "text-red-500"}`}>
                    {testMsg.msg}
                  </span>
                )}
              </div>
              <iframe ref={iframeRef} className="flex-1 border border-neutral-200 rounded-xl w-full bg-white" title="preview" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-100 flex justify-end gap-2 shrink-0">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50">
            Cancelar
          </button>
          <button onClick={onSave}
            disabled={saving || !form.nombre.trim() || !form.asunto.trim() || !form.html.trim()}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:opacity-90 flex items-center gap-2">
            {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
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

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function abrirEditar(t) {
    const r = await boGET(`/backoffice/email-templates/${t.id_template}`);
    if (r.ok) setForm(r.template);
  }

  async function guardar() {
    setSaving(true);
    const payload = { nombre: form.nombre, tipo: form.tipo, asunto: form.asunto, html: form.html };
    const r = form.id_template
      ? await boPUT(`/backoffice/email-templates/${form.id_template}`, payload)
      : await boPOST("/backoffice/email-templates", payload);
    setSaving(false);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    setForm(null);
    cargar();
    setToast({ tipo: "ok", msg: form.id_template ? "Template actualizado." : "Template creado (inactivo)." });
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
    setToast({ tipo: "ok", msg: `Template desactivado. No se enviará correo de tipo "${t.tipo}" hasta que actives otro.` });
  }

  async function eliminar(t) {
    if (t.activo) { setToast({ tipo: "error", msg: "Desactiva el template antes de eliminarlo." }); return; }
    if (!confirm(`¿Eliminar el template "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
    const r = await boDELETE(`/backoffice/email-templates/${t.id_template}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: "Template eliminado." });
  }

  // Agrupar por tipo y filtrar
  const templatesVisibles = filtroTipo === "todos"
    ? templates
    : templates.filter((t) => t.tipo === filtroTipo);

  const tiposConTemplates = [...new Set(templates.map((t) => t.tipo))];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Templates de correo</h1>
          <p className="text-sm text-neutral-500">Solo 1 template activo por tipo. Si ninguno activo, no se envía ese correo.</p>
        </div>
        <button onClick={() => setForm({ ...FORM_VACIO })}
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
          Si <strong>ninguno está activo</strong> para un tipo, el sistema no envía ese correo automático.
          Puedes tener varios templates de reserva y cambiar cuál se usa en cualquier momento.
        </span>
      </div>

      {/* Filtros por tipo */}
      {tiposConTemplates.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFiltroTipo("todos")}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filtroTipo === "todos" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
            Todos ({templates.length})
          </button>
          {tiposConTemplates.map((tipo) => {
            const m = TIPO_META[tipo] || TIPO_META.otro;
            const count = templates.filter((t) => t.tipo === tipo).length;
            return (
              <button key={tipo} onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filtroTipo === tipo ? `${m.color}` : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
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
          <p className="text-sm">No hay templates. Crea el primero o ejecuta el script seed.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesVisibles.map((t) => (
          <TemplateCard key={t.id_template} t={t}
            onEditar={abrirEditar} onEliminar={eliminar}
            onActivar={activar} onDesactivar={desactivar} />
        ))}
      </div>

      {/* Editor modal */}
      {form && (
        <EditorModal form={form} onChange={onChange} onSave={guardar}
          onCancel={() => setForm(null)} saving={saving} assets={assets} tipos={tipos} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${toast.tipo === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className="flex-1 leading-snug">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 shrink-0 mt-0.5">✕</button>
        </div>
      )}
    </div>
  );
}
