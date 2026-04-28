// src/pages/backoffice/clientes/ClienteForm.jsx
import { useEffect, useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{6,20}$/;

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[11px] text-red-500 mt-0.5">{msg}</p>;
}

function Field({ label, required, children, error, hint }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-neutral-400">{hint}</p>}
      <FieldError msg={error} />
    </div>
  );
}

function inputCls(error) {
  return `border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? "border-red-400 focus:ring-red-200 bg-red-50"
      : "border-neutral-300 focus:ring-primary/25 focus:border-primary"
  }`;
}

export default function ClienteForm({
  form,
  modo,
  onChange,
  onSubmit,
  onCancel,
  saving,
}) {
  const [touched, setTouched] = useState({});
  const firstRef = useRef(null);

  // Focus al abrir
  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80);
    setTouched({});
  }, [modo]);

  function touch(name) {
    setTouched((t) => ({ ...t, [name]: true }));
  }

  function handleChange(e) {
    touch(e.target.name);
    onChange(e);
  }

  // Validaciones
  const errors = {};
  if (touched.nombre && !form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  if (touched.nombre && form.nombre.trim().length < 3) errors.nombre = "Mínimo 3 caracteres.";
  if (touched.email_contacto && !form.email_contacto.trim()) errors.email_contacto = "El correo es obligatorio.";
  if (touched.email_contacto && form.email_contacto && !EMAIL_RE.test(form.email_contacto)) errors.email_contacto = "Correo no válido.";
  if (touched.telefono && form.telefono && !PHONE_RE.test(form.telefono)) errors.telefono = "Formato inválido (ej: +51 987654321).";

  const canSubmit =
    form.nombre.trim().length >= 3 &&
    EMAIL_RE.test(form.email_contacto) &&
    (!form.telefono || PHONE_RE.test(form.telefono)) &&
    !saving;

  function handleSubmit(e) {
    // Marca todos los campos tocados al intentar guardar
    setTouched({ nombre: true, email_contacto: true, telefono: true });
    if (!canSubmit) { e.preventDefault(); return; }
    onSubmit(e);
  }

  const titulo = modo === "editar" ? "Editar cliente" : "Nuevo cliente";

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{titulo}</h2>
            {modo === "nuevo" && (
              <p className="text-xs text-neutral-400 mt-0.5">
                Al guardar se enviará un correo de bienvenida al cliente.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1">
          <form
            id="cliente-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Nombre */}
            <Field label="Nombre y apellidos" required error={errors.nombre}>
              <input
                ref={firstRef}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.nombre)}
                placeholder="María García López"
                autoComplete="off"
              />
            </Field>

            {/* Correo */}
            <Field
              label="Correo electrónico"
              required
              error={errors.email_contacto}
              hint="Debe ser único. El cliente recibirá un correo aquí."
            >
              <input
                type="email"
                name="email_contacto"
                value={form.email_contacto}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.email_contacto)}
                placeholder="cliente@email.com"
                autoComplete="off"
              />
            </Field>

            {/* Teléfono */}
            <Field label="Número celular" error={errors.telefono} hint="Incluye código de país (ej: +51 987654321).">
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                onBlur={(e) => touch(e.target.name)}
                className={inputCls(errors.telefono)}
                placeholder="+51 987 654 321"
              />
            </Field>

            {/* País de origen */}
            <Field label="País de origen">
              <input
                type="text"
                name="pais_origen"
                value={form.pais_origen || ""}
                onChange={handleChange}
                className={inputCls()}
                placeholder="Perú, Colombia, México…"
              />
            </Field>

            {/* DNI */}
            <Field label="DNI / documento nacional">
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                className={inputCls()}
                placeholder="12345678"
              />
            </Field>

            {/* Pasaporte */}
            <Field label="Pasaporte">
              <input
                type="text"
                name="pasaporte"
                value={form.pasaporte || ""}
                onChange={handleChange}
                className={inputCls()}
                placeholder="AB123456"
              />
            </Field>

            {/* Canal de origen */}
            <Field label="Canal de origen">
              <select
                name="canal_origen"
                value={form.canal_origen || ""}
                onChange={handleChange}
                className={`${inputCls()} bg-white`}
              >
                <option value="">Selecciona…</option>
                <option value="web">Web / Landing</option>
                <option value="referido">Referido</option>
                <option value="redes">Redes sociales</option>
                <option value="evento">Evento / taller</option>
                <option value="otro">Otro</option>
              </select>
            </Field>

            {/* Activo (solo editar) */}
            {modo === "editar" && (
              <div className="flex items-center gap-3 md:col-span-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="activo"
                    type="checkbox"
                    checked={!!form.activo}
                    onChange={(e) =>
                      onChange({ target: { name: "activo", value: e.target.checked } })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-300 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <label htmlFor="activo" className="text-sm text-neutral-700 cursor-pointer select-none">
                  Cliente activo
                </label>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cliente-form"
            disabled={saving}
            className="px-5 py-2 text-sm bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {saving ? "Guardando…" : modo === "editar" ? "Guardar cambios" : "Crear cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
