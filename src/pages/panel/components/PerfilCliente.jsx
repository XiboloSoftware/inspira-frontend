// src/pages/panel/components/PerfilCliente.jsx
import { useEffect, useState } from "react";
import { apiPATCH } from "../../../services/api";

// ── Países con prefijo telefónico ─────────────────────────────────────────────
const PAISES = [
  { codigo: "PE", nombre: "Perú",               prefijo: "+51",  emoji: "🇵🇪" },
  { codigo: "ES", nombre: "España",             prefijo: "+34",  emoji: "🇪🇸" },
  { codigo: "CO", nombre: "Colombia",           prefijo: "+57",  emoji: "🇨🇴" },
  { codigo: "MX", nombre: "México",             prefijo: "+52",  emoji: "🇲🇽" },
  { codigo: "AR", nombre: "Argentina",          prefijo: "+54",  emoji: "🇦🇷" },
  { codigo: "CL", nombre: "Chile",              prefijo: "+56",  emoji: "🇨🇱" },
  { codigo: "EC", nombre: "Ecuador",            prefijo: "+593", emoji: "🇪🇨" },
  { codigo: "BO", nombre: "Bolivia",            prefijo: "+591", emoji: "🇧🇴" },
  { codigo: "VE", nombre: "Venezuela",          prefijo: "+58",  emoji: "🇻🇪" },
  { codigo: "UY", nombre: "Uruguay",            prefijo: "+598", emoji: "🇺🇾" },
  { codigo: "PY", nombre: "Paraguay",           prefijo: "+595", emoji: "🇵🇾" },
  { codigo: "CR", nombre: "Costa Rica",         prefijo: "+506", emoji: "🇨🇷" },
  { codigo: "PA", nombre: "Panamá",             prefijo: "+507", emoji: "🇵🇦" },
  { codigo: "GT", nombre: "Guatemala",          prefijo: "+502", emoji: "🇬🇹" },
  { codigo: "HN", nombre: "Honduras",           prefijo: "+504", emoji: "🇭🇳" },
  { codigo: "SV", nombre: "El Salvador",        prefijo: "+503", emoji: "🇸🇻" },
  { codigo: "NI", nombre: "Nicaragua",          prefijo: "+505", emoji: "🇳🇮" },
  { codigo: "DO", nombre: "Rep. Dominicana",    prefijo: "+1",   emoji: "🇩🇴" },
  { codigo: "CU", nombre: "Cuba",               prefijo: "+53",  emoji: "🇨🇺" },
  { codigo: "US", nombre: "Estados Unidos",     prefijo: "+1",   emoji: "🇺🇸" },
  { codigo: "BR", nombre: "Brasil",             prefijo: "+55",  emoji: "🇧🇷" },
  { codigo: "PT", nombre: "Portugal",           prefijo: "+351", emoji: "🇵🇹" },
  { codigo: "FR", nombre: "Francia",            prefijo: "+33",  emoji: "🇫🇷" },
  { codigo: "DE", nombre: "Alemania",           prefijo: "+49",  emoji: "🇩🇪" },
  { codigo: "IT", nombre: "Italia",             prefijo: "+39",  emoji: "🇮🇹" },
  { codigo: "GB", nombre: "Reino Unido",        prefijo: "+44",  emoji: "🇬🇧" },
];

const AREAS = [
  "Administración y Negocios", "Derecho", "Ingeniería y Tecnología",
  "Ciencias Sociales", "Educación", "Salud", "Humanidades",
  "Medio Ambiente", "Arte y Diseño", "Otra",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseTelefono(tel) {
  if (!tel) return { prefijo: "+51", numero: "" };
  const prefijos = [...PAISES.map(p => p.prefijo)].sort((a, b) => b.length - a.length);
  for (const p of prefijos) {
    if (tel.startsWith(p + " ")) return { prefijo: p, numero: tel.slice(p.length + 1) };
    if (tel.startsWith(p))       return { prefijo: p, numero: tel.slice(p.length) };
  }
  return { prefijo: "+51", numero: tel };
}

function paisDePrefijo(prefijo) {
  return PAISES.find(p => p.nombre === prefijo) || null;
}

// ── Componentes menores ───────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{children}</p>
  );
}

function InfoFila({ icono, etiqueta, valor }) {
  if (!valor) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-neutral-50 last:border-0">
      <span className="text-lg shrink-0 leading-none mt-0.5">{icono}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-400 font-medium">{etiqueta}</p>
        <p className="text-sm font-semibold text-neutral-800 break-words">{valor}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
      {children}
      {hint && <span className="ml-1 font-normal text-neutral-400">{hint}</span>}
    </label>
  );
}

function TextInput({ name, value, onChange, placeholder, type = "text", disabled, className = "" }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function TelefonoInput({ prefijo, numero, onPrefijo, onNumero, label, hint }) {
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex gap-2">
        <select
          value={prefijo}
          onChange={e => onPrefijo(e.target.value)}
          className="w-28 rounded-xl border border-neutral-200 px-2 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition shrink-0"
        >
          {PAISES.map(p => (
            <option key={p.codigo} value={p.prefijo}>{p.emoji} {p.prefijo}</option>
          ))}
        </select>
        <input
          type="tel"
          value={numero}
          onChange={e => onNumero(e.target.value)}
          placeholder="999 999 999"
          className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition"
        />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PerfilCliente({ user, onUserUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [okMsg, setOkMsg]       = useState("");
  const [form, setForm]         = useState({});

  useEffect(() => {
    if (!user) return;
    const tp = parseTelefono(user.telefono);
    const de = user.datos_extra || {};
    const wp = parseTelefono(de.whatsapp);
    const mismoWA = !de.whatsapp || de.whatsapp === user.telefono;

    setForm({
      nombre:            user.nombre        || "",
      pais_origen:       user.pais_origen   || "",
      prefijo_telefono:  tp.prefijo,
      telefono_numero:   tp.numero,
      mismo_whatsapp:    mismoWA,
      prefijo_whatsapp:  wp.prefijo,
      whatsapp_numero:   wp.numero,
      dni:               user.dni           || "",
      pasaporte:         user.pasaporte     || "",
      ciudad:            de.ciudad          || "",
      fecha_nacimiento:  de.fecha_nacimiento || "",
      carrera_titulo:    de.carrera_titulo  || "",
      area_carrera:      de.area_carrera    || "",
      universidad_origen: de.universidad_origen || "",
    });
  }, [user]);

  if (!user) return <p className="text-sm text-neutral-400 p-4">Cargando datos…</p>;

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  function handleChange(e) { set(e.target.name, e.target.value); }

  function handlePaisChange(nombre) {
    const pais = PAISES.find(p => p.nombre === nombre);
    setForm(p => ({
      ...p,
      pais_origen:      nombre,
      prefijo_telefono: pais?.prefijo || p.prefijo_telefono,
      prefijo_whatsapp: p.mismo_whatsapp ? (pais?.prefijo || p.prefijo_whatsapp) : p.prefijo_whatsapp,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOkMsg("");
    try {
      const telefono = form.telefono_numero
        ? `${form.prefijo_telefono} ${form.telefono_numero}`.trim()
        : null;
      const whatsapp = form.mismo_whatsapp
        ? telefono
        : (form.whatsapp_numero ? `${form.prefijo_whatsapp} ${form.whatsapp_numero}`.trim() : null);

      const body = {
        nombre:      form.nombre      || null,
        telefono,
        dni:         form.dni         || null,
        pasaporte:   form.pasaporte   || null,
        pais_origen: form.pais_origen || null,
        datos_extra: {
          whatsapp,
          ciudad:             form.ciudad             || null,
          fecha_nacimiento:   form.fecha_nacimiento   || null,
          carrera_titulo:     form.carrera_titulo     || null,
          area_carrera:       form.area_carrera       || null,
          universidad_origen: form.universidad_origen || null,
        },
      };

      const r = await apiPATCH("/cliente/me", body);
      if (!r.ok) { setError(r.message || "Error al guardar."); return; }
      if (onUserUpdated) onUserUpdated(r.cliente || { ...user, ...body });
      setOkMsg("Datos guardados correctamente.");
      setEditMode(false);
    } catch {
      setError("Ocurrió un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  }

  // ── Vista lectura ─────────────────────────────────────────────────────────
  if (!editMode) {
    const de = user.datos_extra || {};
    const tp = parseTelefono(user.telefono);
    const paisObj = PAISES.find(p => p.nombre === user.pais_origen);

    return (
      <div className="space-y-3">
        {/* Tarjeta principal */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#023A4B] to-[#046C8C] px-5 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-white">
                  {(user.nombre || user.email_contacto || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-white truncate">
                  {user.nombre || "Sin nombre"}
                </p>
                <p className="text-sm text-white/70 truncate">{user.email_contacto}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Cliente desde {new Date(user.fecha_registro).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEditMode(true); setError(""); setOkMsg(""); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-all border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </button>
          </div>

          {/* Contenido info */}
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
            {/* Columna izquierda */}
            <div className="pb-4 sm:pb-0 sm:pr-8">
              <SectionLabel>Contacto</SectionLabel>
              <InfoFila icono="📞" etiqueta="Teléfono"
                valor={user.telefono ? `${tp.prefijo} ${tp.numero}` : null} />
              <InfoFila icono="💬" etiqueta="WhatsApp"
                valor={de.whatsapp && de.whatsapp !== user.telefono ? (() => { const wp = parseTelefono(de.whatsapp); return `${wp.prefijo} ${wp.numero}`; })() : (user.telefono ? "Mismo que teléfono" : null)} />
              <InfoFila icono="🏙️" etiqueta="Ciudad" valor={de.ciudad} />
              <InfoFila icono="🌍" etiqueta="País de origen"
                valor={paisObj ? `${paisObj.emoji} ${user.pais_origen}` : user.pais_origen} />
              <InfoFila icono="🎂" etiqueta="Fecha de nacimiento"
                valor={de.fecha_nacimiento ? new Date(de.fecha_nacimiento + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : null} />
            </div>

            {/* Columna derecha */}
            <div className="pt-4 sm:pt-0 sm:pl-8">
              <SectionLabel>Documentos e historial</SectionLabel>
              <InfoFila icono="🪪" etiqueta="DNI / Documento" valor={user.dni} />
              <InfoFila icono="📘" etiqueta="Pasaporte" valor={user.pasaporte} />
              {(de.carrera_titulo || de.universidad_origen || de.area_carrera) && (
                <>
                  <div className="mt-4 mb-3">
                    <SectionLabel>Datos académicos</SectionLabel>
                  </div>
                  <InfoFila icono="🎓" etiqueta="Carrera / Título" valor={de.carrera_titulo} />
                  <InfoFila icono="🏛️" etiqueta="Universidad" valor={de.universidad_origen} />
                  <InfoFila icono="📚" etiqueta="Área de estudio" valor={de.area_carrera} />
                </>
              )}
            </div>
          </div>

          {/* Tip de datos académicos si no están */}
          {!de.carrera_titulo && !de.universidad_origen && (
            <div className="mx-5 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5">
              <span className="text-blue-500 text-lg shrink-0 leading-none mt-0.5">💡</span>
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Completa los datos académicos en "Editar" para que se pre-rellenen automáticamente en el formulario de tu solicitud.
              </p>
            </div>
          )}
        </div>

        {okMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <span className="text-emerald-500">✓</span>
            <p className="text-sm font-medium text-emerald-700">{okMsg}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Modo edición ──────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header formulario */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-bold text-neutral-900">Editar mi perfil</p>
          <p className="text-xs text-neutral-400 mt-0.5">Los datos académicos se comparten con tus solicitudes</p>
        </div>
        <button type="button"
          onClick={() => { setEditMode(false); setError(""); setOkMsg(""); }}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition">
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="text-red-500">⚠</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Identidad ── */}
        <div>
          <SectionLabel>Identidad</SectionLabel>
          <div className="space-y-3">
            <div>
              <FieldLabel>Nombre completo</FieldLabel>
              <TextInput name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Ej: María García López" />
            </div>
            <div>
              <FieldLabel hint="(no editable desde el panel)">Email</FieldLabel>
              <TextInput name="email_contacto" value={user.email_contacto || ""} disabled />
            </div>
          </div>
        </div>

        {/* ── Origen y ubicación ── */}
        <div>
          <SectionLabel>Origen y ubicación</SectionLabel>
          <div className="space-y-3">
            <div>
              <FieldLabel>País de origen</FieldLabel>
              <select
                value={form.pais_origen}
                onChange={e => handlePaisChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition"
              >
                <option value="">— Selecciona tu país —</option>
                {PAISES.map(p => (
                  <option key={p.codigo} value={p.nombre}>{p.emoji} {p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel hint="(opcional)">Ciudad de residencia</FieldLabel>
              <TextInput name="ciudad" value={form.ciudad} onChange={handleChange}
                placeholder="Ej: Lima, Madrid, Bogotá…" />
            </div>
            <div>
              <FieldLabel hint="(opcional)">Fecha de nacimiento</FieldLabel>
              <TextInput name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange}
                type="date" />
            </div>
          </div>
        </div>

        {/* ── Contacto ── */}
        <div>
          <SectionLabel>Contacto</SectionLabel>
          <div className="space-y-3">
            <TelefonoInput
              label="Teléfono"
              prefijo={form.prefijo_telefono}
              numero={form.telefono_numero}
              onPrefijo={v => set("prefijo_telefono", v)}
              onNumero={v => set("telefono_numero", v)}
            />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-semibold text-neutral-700">WhatsApp</label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer ml-auto">
                  <input
                    type="checkbox"
                    checked={form.mismo_whatsapp}
                    onChange={e => set("mismo_whatsapp", e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#023A4B]"
                  />
                  <span className="text-xs text-neutral-500">Mismo que teléfono</span>
                </label>
              </div>
              {!form.mismo_whatsapp && (
                <TelefonoInput
                  label=""
                  prefijo={form.prefijo_whatsapp}
                  numero={form.whatsapp_numero}
                  onPrefijo={v => set("prefijo_whatsapp", v)}
                  onNumero={v => set("whatsapp_numero", v)}
                />
              )}
              {form.mismo_whatsapp && (
                <p className="text-xs text-neutral-400 italic">Se usará el mismo número que el teléfono</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Documentos ── */}
        <div>
          <SectionLabel>Documentos de identidad</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel hint="(opcional)">DNI / NIE / Cédula</FieldLabel>
              <TextInput name="dni" value={form.dni} onChange={handleChange}
                placeholder="12345678" />
            </div>
            <div>
              <FieldLabel hint="(opcional)">Número de pasaporte</FieldLabel>
              <TextInput name="pasaporte" value={form.pasaporte} onChange={handleChange}
                placeholder="AB123456" />
            </div>
          </div>
        </div>

        {/* ── Datos académicos ── */}
        <div>
          <SectionLabel>Datos académicos</SectionLabel>
          <p className="text-xs text-neutral-400 mb-3 -mt-1">
            Se pre-rellenarán automáticamente en el formulario de tus solicitudes.
          </p>
          <div className="space-y-3">
            <div>
              <FieldLabel hint="(opcional)">Carrera universitaria o título</FieldLabel>
              <TextInput name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange}
                placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…" />
            </div>
            <div>
              <FieldLabel hint="(opcional)">Universidad de origen</FieldLabel>
              <TextInput name="universidad_origen" value={form.universidad_origen} onChange={handleChange}
                placeholder="Ej: PUCP, UBA, UNAM, Universidad de Lima…" />
            </div>
            <div>
              <FieldLabel hint="(opcional)">Área de estudio</FieldLabel>
              <select
                value={form.area_carrera}
                onChange={e => set("area_carrera", e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition"
              >
                <option value="">— Selecciona tu área —</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer botones */}
        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
          <button type="button"
            onClick={() => { setEditMode(false); setError(""); setOkMsg(""); }}
            className="px-5 py-2.5 text-sm font-medium rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition active:scale-95">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
              : <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Guardar cambios
                </>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
