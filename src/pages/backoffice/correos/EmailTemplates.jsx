// src/pages/backoffice/correos/EmailTemplates.jsx
import { useEffect, useRef, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";

const FORM_VACIO = {
  id_template: null,
  nombre: "",
  asunto: "",
  html: "",
  variables: '["nombre","email"]',
};

function Badge({ children, color = "neutral" }) {
  const cls = {
    neutral: "bg-neutral-100 text-neutral-600",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-600",
  }[color];
  return <span className={`text-[11px] px-2 py-0.5 rounded-full ${cls}`}>{children}</span>;
}

function TemplateCard({ t, onEditar, onEliminar, onTest }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm truncate">{t.nombre}</p>
          <p className="text-xs text-neutral-500 truncate mt-0.5">{t.asunto}</p>
        </div>
        <Badge color="green">Activo</Badge>
      </div>
      <p className="text-[11px] text-neutral-400 mb-3">
        Actualizado: {new Date(t.fecha_actualizacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => onEditar(t)}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors">
          Editar
        </button>
        <button onClick={() => onTest(t)}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 transition-colors">
          Probar
        </button>
        <button onClick={() => onEliminar(t)}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  );
}

function Editor({ form, onChange, onSave, onCancel, saving, assets }) {
  const iframeRef = useRef(null);
  const [tab, setTab] = useState("editor"); // editor | preview
  const [testEmail, setTestEmail] = useState("");
  const [testNombre, setTestNombre] = useState("Cliente Ejemplo");
  const [testLoading, setTestLoading] = useState(false);
  const [testMsg, setTestMsg] = useState(null);

  function updatePreview() {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      const html = (form.html || "").replace(/\$\{nombre\}/g, testNombre).replace(/\$\{email\}/g, testEmail || "cliente@email.com");
      doc.open();
      doc.write(html);
      doc.close();
    }
  }

  useEffect(() => {
    if (tab === "preview") updatePreview();
  }, [tab, form.html, testNombre]);

  async function enviarPrueba() {
    if (!testEmail) return setTestMsg({ tipo: "error", msg: "Ingresa un email de destino" });
    setTestLoading(true);
    setTestMsg(null);
    const r = await boPOST(`/backoffice/email-templates/${form.id_template}/enviar-prueba`, {
      to: testEmail,
      variables_data: { nombre: testNombre, email: testEmail },
    });
    setTestLoading(false);
    setTestMsg({ tipo: r.ok ? "ok" : "error", msg: r.msg });
  }

  const isEditing = !!form.id_template;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">
            {isEditing ? `Editar: ${form.nombre}` : "Nuevo template"}
          </h2>
          <button onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-0 border-b border-neutral-100">
          {["editor", "preview"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${tab === t ? "bg-white border border-b-white border-neutral-200 text-primary font-medium -mb-px" : "text-neutral-500 hover:text-neutral-700"}`}>
              {t === "editor" ? "Editor" : "Preview"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {tab === "editor" ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Nombre + Asunto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600">Nombre del template <span className="text-red-400">*</span></label>
                  <input type="text" value={form.nombre}
                    onChange={(e) => onChange("nombre", e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="Ej: Bienvenida cliente nuevo" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-neutral-600">Asunto del correo <span className="text-red-400">*</span></label>
                  <input type="text" value={form.asunto}
                    onChange={(e) => onChange("asunto", e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder="Ej: ¡Bienvenido/a a Inspira! 🚀" />
                </div>
              </div>

              {/* Variables hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                <strong>Variables disponibles en el HTML:</strong>{" "}
                <code className="bg-amber-100 px-1 rounded">{"${nombre}"}</code>{" "}
                <code className="bg-amber-100 px-1 rounded">{"${email}"}</code>
                {" — "}Se reemplazan al enviar con los datos reales del cliente.
              </div>

              {/* Media selector */}
              {assets.length > 0 && (
                <details className="border border-neutral-200 rounded-lg">
                  <summary className="px-3 py-2 text-xs font-medium text-neutral-600 cursor-pointer select-none">
                    📎 Insertar imagen del panel Media (copiar URL)
                  </summary>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {assets.map((a) => (
                      <button key={a.id_asset} type="button"
                        onClick={() => { navigator.clipboard.writeText(a.url_publica); }}
                        title={`Copiar URL: ${a.url_publica}`}
                        className="flex flex-col items-center gap-1 p-1 rounded-lg border border-neutral-200 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <img src={a.url_publica} alt={a.nombre} className="h-14 w-full object-cover rounded" />
                        <span className="text-[10px] text-neutral-500 truncate w-full text-center">{a.nombre}</span>
                      </button>
                    ))}
                  </div>
                </details>
              )}

              {/* HTML Editor */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-medium text-neutral-600">HTML del correo <span className="text-red-400">*</span></label>
                <textarea
                  value={form.html}
                  onChange={(e) => onChange("html", e.target.value)}
                  className="border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
                  rows={20}
                  placeholder="<!DOCTYPE html><html>..."
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 p-5 overflow-hidden">
              {/* Preview controls */}
              <div className="flex gap-2 items-center flex-wrap">
                <input type="text" value={testNombre}
                  onChange={(e) => { setTestNombre(e.target.value); }}
                  placeholder="Nombre de prueba"
                  className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/25" />
                <input type="email" value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Email para enviar prueba"
                  className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/25" />
                {isEditing && (
                  <button onClick={enviarPrueba} disabled={testLoading}
                    className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
                    {testLoading ? "Enviando…" : "Enviar prueba"}
                  </button>
                )}
                {testMsg && (
                  <span className={`text-xs ${testMsg.tipo === "ok" ? "text-emerald-600" : "text-red-500"}`}>
                    {testMsg.msg}
                  </span>
                )}
              </div>
              <iframe ref={iframeRef} className="flex-1 border border-neutral-200 rounded-xl w-full" title="preview" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50">
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving || !form.nombre || !form.asunto || !form.html}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:opacity-90 flex items-center gap-2">
            {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear template"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); // null = cerrado
  const [toast, setToast] = useState(null);

  useEffect(() => { cargar(); cargarAssets(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/email-templates");
    if (r.ok) setTemplates(r.templates || []);
    setLoading(false);
  }

  async function cargarAssets() {
    const r = await boGET("/backoffice/media");
    if (r.ok) setAssets(r.assets || []);
  }

  function abrirNuevo() {
    setForm({ ...FORM_VACIO });
  }

  async function abrirEditar(t) {
    const r = await boGET(`/backoffice/email-templates/${t.id_template}`);
    if (r.ok) setForm(r.template);
  }

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function guardar() {
    setSaving(true);
    const payload = { nombre: form.nombre, asunto: form.asunto, html: form.html, variables: form.variables };
    const r = form.id_template
      ? await boPUT(`/backoffice/email-templates/${form.id_template}`, payload)
      : await boPOST("/backoffice/email-templates", payload);
    setSaving(false);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    setForm(null);
    cargar();
    setToast({ tipo: "ok", msg: form.id_template ? "Template actualizado." : "Template creado." });
  }

  async function eliminar(t) {
    if (!confirm(`¿Eliminar el template "${t.nombre}"?`)) return;
    const r = await boDELETE(`/backoffice/email-templates/${t.id_template}`);
    if (!r.ok) { setToast({ tipo: "error", msg: r.msg }); return; }
    cargar();
    setToast({ tipo: "ok", msg: "Template eliminado." });
  }

  function abrirTest(t) {
    abrirEditar(t).then(() => {});
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Templates de correo</h1>
          <p className="text-sm text-neutral-500">Gestiona las plantillas HTML de los emails automáticos.</p>
        </div>
        <button onClick={abrirNuevo}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:opacity-90 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo template
        </button>
      </div>

      {/* Lista */}
      {loading && <p className="text-sm text-neutral-400 text-center py-8">Cargando templates…</p>}
      {!loading && templates.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <p className="text-sm">No hay templates creados.</p>
          <p className="text-xs mt-1">Crea uno para automatizar tus correos.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <TemplateCard key={t.id_template} t={t}
            onEditar={abrirEditar} onEliminar={eliminar} onTest={abrirTest} />
        ))}
      </div>

      {/* Editor modal */}
      {form && (
        <Editor form={form} onChange={onChange} onSave={guardar}
          onCancel={() => setForm(null)} saving={saving} assets={assets} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${toast.tipo === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}
