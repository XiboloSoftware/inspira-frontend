// src/pages/panel/components/PerfilCliente.jsx
import { useEffect, useRef, useState } from "react";
import { apiPATCH } from "../../../services/api";

const PAISES = [
  { codigo: "PE", nombre: "Perú",            prefijo: "+51",  emoji: "🇵🇪" },
  { codigo: "ES", nombre: "España",          prefijo: "+34",  emoji: "🇪🇸" },
  { codigo: "CO", nombre: "Colombia",        prefijo: "+57",  emoji: "🇨🇴" },
  { codigo: "MX", nombre: "México",          prefijo: "+52",  emoji: "🇲🇽" },
  { codigo: "AR", nombre: "Argentina",       prefijo: "+54",  emoji: "🇦🇷" },
  { codigo: "CL", nombre: "Chile",           prefijo: "+56",  emoji: "🇨🇱" },
  { codigo: "EC", nombre: "Ecuador",         prefijo: "+593", emoji: "🇪🇨" },
  { codigo: "BO", nombre: "Bolivia",         prefijo: "+591", emoji: "🇧🇴" },
  { codigo: "VE", nombre: "Venezuela",       prefijo: "+58",  emoji: "🇻🇪" },
  { codigo: "UY", nombre: "Uruguay",         prefijo: "+598", emoji: "🇺🇾" },
  { codigo: "PY", nombre: "Paraguay",        prefijo: "+595", emoji: "🇵🇾" },
  { codigo: "CR", nombre: "Costa Rica",      prefijo: "+506", emoji: "🇨🇷" },
  { codigo: "PA", nombre: "Panamá",          prefijo: "+507", emoji: "🇵🇦" },
  { codigo: "GT", nombre: "Guatemala",       prefijo: "+502", emoji: "🇬🇹" },
  { codigo: "HN", nombre: "Honduras",        prefijo: "+504", emoji: "🇭🇳" },
  { codigo: "SV", nombre: "El Salvador",     prefijo: "+503", emoji: "🇸🇻" },
  { codigo: "NI", nombre: "Nicaragua",       prefijo: "+505", emoji: "🇳🇮" },
  { codigo: "DO", nombre: "Rep. Dominicana", prefijo: "+1",   emoji: "🇩🇴" },
  { codigo: "CU", nombre: "Cuba",            prefijo: "+53",  emoji: "🇨🇺" },
  { codigo: "US", nombre: "Estados Unidos",  prefijo: "+1",   emoji: "🇺🇸" },
  { codigo: "BR", nombre: "Brasil",          prefijo: "+55",  emoji: "🇧🇷" },
  { codigo: "PT", nombre: "Portugal",        prefijo: "+351", emoji: "🇵🇹" },
  { codigo: "FR", nombre: "Francia",         prefijo: "+33",  emoji: "🇫🇷" },
  { codigo: "DE", nombre: "Alemania",        prefijo: "+49",  emoji: "🇩🇪" },
  { codigo: "IT", nombre: "Italia",          prefijo: "+39",  emoji: "🇮🇹" },
  { codigo: "GB", nombre: "Reino Unido",     prefijo: "+44",  emoji: "🇬🇧" },
];

const AREAS = [
  "Administración y Negocios", "Derecho", "Ingeniería y Tecnología",
  "Ciencias Sociales", "Educación", "Salud", "Humanidades",
  "Medio Ambiente", "Arte y Diseño", "Otra",
];

const UNIS = [
  "Universidad Nacional Mayor de San Marcos", "Pontificia Universidad Católica del Perú",
  "Universidad de Lima", "Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia", "Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico", "Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas", "Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal", "Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia", "Universidad de los Andes",
  "Universidad de Antioquia", "Pontificia Universidad Javeriana",
  "Universidad del Rosario", "Universidad del Valle",
  "Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México", "Instituto Politécnico Nacional",
  "Universidad de Guadalajara", "Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla", "Tecnológico de Monterrey",
  "Universidad de Buenos Aires", "Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata", "Universidad Nacional de Rosario",
  "Universidad de Chile", "Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo", "Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador", "ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela", "Universidad del Zulia",
  "Universidad Mayor de San Andrés", "Universidad Nacional de Asunción",
  "Universidad de la República", "Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala",
  "Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa", "Universidade do Porto",
];

const LONG_TEL = {
  "+51": [9, 9], "+34": [9, 9], "+57": [10, 10], "+52": [10, 10],
  "+54": [10, 10], "+56": [9, 9], "+593": [9, 9], "+591": [8, 8],
  "+58": [10, 10], "+598": [8, 9], "+595": [9, 9], "+506": [8, 8],
  "+507": [8, 8], "+502": [8, 8], "+504": [8, 8], "+503": [8, 8],
  "+505": [8, 8], "+1": [10, 10], "+53": [8, 8], "+55": [10, 11],
  "+351": [9, 9], "+33": [9, 9], "+49": [10, 11], "+39": [9, 10],
  "+44": [10, 10],
};

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function parseTelefono(tel) {
  if (!tel) return { prefijo: "+51", numero: "" };
  const prefijos = [...PAISES.map(p => p.prefijo)].sort((a, b) => b.length - a.length);
  for (const p of prefijos) {
    if (tel.startsWith(p + " ")) return { prefijo: p, numero: tel.slice(p.length + 1) };
    if (tel.startsWith(p))       return { prefijo: p, numero: tel.slice(p.length) };
  }
  return { prefijo: "+51", numero: tel };
}

function fmtFecha(iso) {
  if (!iso) return null;
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Combobox ───────────────────────────────────────────────────────────────────
function Combobox({ value, onChange, options, placeholder, renderOption, getLabel, allowCustom = false }) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [display, setDisplay] = useState("");
  const wrapRef  = useRef(null);
  const queryRef = useRef("");

  useEffect(() => { queryRef.current = query; }, [query]);
  useEffect(() => { setDisplay(value ? (getLabel ? getLabel(value) : value) : ""); }, [value]); // eslint-disable-line

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        if (allowCustom && queryRef.current.trim()) {
          const custom = queryRef.current.trim();
          onChange(custom);
          setDisplay(custom);
        }
        setQuery("");
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [allowCustom]); // eslint-disable-line

  const filtered = query.length >= 1
    ? options.filter(o => {
        const label = getLabel ? getLabel(o) : String(o);
        return norm(label).includes(norm(query));
      }).slice(0, 8)
    : options.slice(0, 8);

  function select(opt) {
    onChange(opt);
    setDisplay(getLabel ? getLabel(opt) : String(opt));
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={open ? query : display}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (filtered.length > 0) select(filtered[0]);
            else if (allowCustom && query.trim()) {
              const c = query.trim(); onChange(c); setDisplay(c); setQuery(""); setOpen(false);
            }
          } else if (e.key === "Escape") { setQuery(""); setOpen(false); }
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden max-h-44 overflow-y-auto">
          {filtered.map((o, i) => (
            <li key={i}>
              <button type="button" onMouseDown={() => select(o)}
                className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-[#E8F5EE] hover:text-[#1D6A4A] transition-colors">
                {renderOption ? renderOption(o) : String(o)}
              </button>
            </li>
          ))}
          {allowCustom && (
            <li className="px-3 py-1.5 text-[11px] text-neutral-400 border-t italic">
              Escribe el nombre si no aparece en la lista
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Primitivos de formulario ────────────────────────────────────────────────────
function FL({ children, opt }) {
  return (
    <label className="block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide">
      {children}{opt && <span className="ml-1 font-normal normal-case tracking-normal text-neutral-400">(opcional)</span>}
    </label>
  );
}

function TI({ name, value, onChange, placeholder, type = "text", disabled, className = "" }) {
  return (
    <input type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}
    />
  );
}

function TelefonoInput({ prefijo, numero, onPrefijo, onNumero }) {
  const digits   = numero.replace(/\D/g, "");
  const rango    = LONG_TEL[prefijo];
  const invalido = digits.length > 0 && rango && (digits.length < rango[0] || digits.length > rango[1]);
  const valido   = digits.length > 0 && rango && digits.length >= rango[0] && digits.length <= rango[1];
  const hintLong = rango ? (rango[0] === rango[1] ? `${rango[0]} dígitos` : `${rango[0]}–${rango[1]} dígitos`) : null;

  return (
    <div>
      <div className="flex gap-2">
        <select value={prefijo} onChange={e => onPrefijo(e.target.value)}
          className="w-24 rounded-lg border border-neutral-200 px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition shrink-0">
          {PAISES.map(p => <option key={p.codigo} value={p.prefijo}>{p.emoji} {p.prefijo}</option>)}
        </select>
        <input type="tel" value={numero} onChange={e => onNumero(e.target.value)}
          placeholder="999 999 999"
          className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${invalido ? "border-red-300 focus:ring-red-200" : "border-neutral-200 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A]"}`}
        />
      </div>
      {hintLong && digits.length > 0 && (
        <p className={`text-[11px] mt-1 ${invalido ? "text-red-500" : valido ? "text-emerald-600" : "text-neutral-400"}`}>
          {invalido ? `Se esperan ${hintLong} (tienes ${digits.length})` : `✓ Longitud correcta (${digits.length} dígitos)`}
        </p>
      )}
    </div>
  );
}

// ── Chip de vista ──────────────────────────────────────────────────────────────
function Chip({ label, value, full }) {
  const vacio = !value;
  return (
    <div className={`border rounded-xl px-3 py-2 ${full ? "col-span-2" : ""} ${!vacio ? "border-[#1D6A4A]/20 bg-[#E8F5EE]" : "border-neutral-200 bg-neutral-50"}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-0.5">{label}</p>
      <p className={`text-[12px] font-semibold truncate ${vacio ? "text-neutral-300 italic" : "text-neutral-800"}`}>
        {vacio ? "N/D" : value}
      </p>
    </div>
  );
}

function SecLabel({ children }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#1D6A4A] mb-2 mt-1">{children}</p>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
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
      nombre:                user.nombre        || "",
      pais_origen:           user.pais_origen   || "",
      prefijo_telefono:      tp.prefijo,
      telefono_numero:       tp.numero,
      mismo_whatsapp:        mismoWA,
      prefijo_whatsapp:      wp.prefijo,
      whatsapp_numero:       wp.numero,
      dni:                   user.dni           || "",
      dni_emision:           de.dni_emision     || "",
      dni_vencimiento:       de.dni_vencimiento || "",
      pasaporte:             user.pasaporte     || "",
      ciudad:                de.ciudad          || "",
      fecha_nacimiento:      de.fecha_nacimiento      || "",
      nacionalidad:          de.nacionalidad          || "",
      pasaporte_emision:     de.pasaporte_emision     || "",
      pasaporte_vencimiento: de.pasaporte_vencimiento || "",
      carrera_titulo:        de.carrera_titulo        || "",
      area_carrera:          de.area_carrera          || "",
      universidad_origen:    de.universidad_origen    || "",
      inicio_estudios:       de.inicio_estudios       || "",
      fin_estudios:          de.fin_estudios          || "",
      fecha_titulo:          de.fecha_titulo          || "",
    });
  }, [user]);

  if (!user) return <p className="text-sm text-neutral-400 p-4">Cargando…</p>;

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
    setSaving(true); setError(""); setOkMsg("");
    try {
      const telefono = form.telefono_numero
        ? `${form.prefijo_telefono} ${form.telefono_numero}`.trim() : null;
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
          ciudad:                form.ciudad                || null,
          fecha_nacimiento:      form.fecha_nacimiento      || null,
          nacionalidad:          form.nacionalidad          || null,
          dni_emision:           form.dni_emision           || null,
          dni_vencimiento:       form.dni_vencimiento       || null,
          pasaporte_emision:     form.pasaporte_emision     || null,
          pasaporte_vencimiento: form.pasaporte_vencimiento || null,
          carrera_titulo:        form.carrera_titulo        || null,
          area_carrera:          form.area_carrera          || null,
          universidad_origen:    form.universidad_origen    || null,
          inicio_estudios:       form.inicio_estudios       || null,
          fin_estudios:          form.fin_estudios          || null,
          fecha_titulo:          form.fecha_titulo          || null,
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

  // ── Vista ───────────────────────────────────────────────────────────────────
  if (!editMode) {
    const de = user.datos_extra || {};
    const tp = parseTelefono(user.telefono);
    const paisObj = PAISES.find(p => p.nombre === user.pais_origen);

    return (
      <div className="space-y-3">
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-white">
                  {(user.nombre || user.email_contacto || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-snug">{user.nombre || "Sin nombre"}</p>
                <p className="text-xs text-white/60 truncate">{user.email_contacto}</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Cliente desde {new Date(user.fecha_registro).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => { setEditMode(true); setError(""); setOkMsg(""); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition border border-white/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar
            </button>
          </div>

          {/* Chips grid */}
          <div className="px-5 py-4 space-y-3">

            <SecLabel>Datos personales</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <Chip label="Fecha de nacimiento" value={fmtFecha(de.fecha_nacimiento)} />
              <Chip label="País de origen"      value={paisObj ? `${paisObj.emoji} ${user.pais_origen}` : user.pais_origen} />
              <Chip label="Ciudad"              value={de.ciudad} />
              <Chip label="Nacionalidad"        value={de.nacionalidad} />
              <Chip label="Teléfono"            value={user.telefono ? `${tp.prefijo} ${tp.numero}` : null} />
              <Chip label="WhatsApp"            value={de.whatsapp && de.whatsapp !== user.telefono
                ? (() => { const w = parseTelefono(de.whatsapp); return `${w.prefijo} ${w.numero}`; })()
                : (user.telefono ? "Mismo que teléfono" : null)} />
            </div>

            <SecLabel>Documentos de identidad</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <Chip label="DNI / Cédula"           value={user.dni} />
              <Chip label="DNI — Emisión"          value={fmtFecha(de.dni_emision)} />
              <Chip label="DNI — Vencimiento"      value={fmtFecha(de.dni_vencimiento)} />
              <Chip label="Pasaporte"              value={user.pasaporte} />
              <Chip label="Pasaporte — Emisión"    value={fmtFecha(de.pasaporte_emision)} />
              <Chip label="Pasaporte — Vencimiento" value={fmtFecha(de.pasaporte_vencimiento)} />
            </div>

            <SecLabel>Datos académicos</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <Chip label="Carrera / Título"    value={de.carrera_titulo} />
              <Chip label="Área de estudio"     value={de.area_carrera} />
              <Chip label="Universidad"         value={de.universidad_origen} full />
              <Chip label="Inicio de estudios"  value={de.inicio_estudios} />
              <Chip label="Fin de estudios"     value={de.fin_estudios} />
              <Chip label="Fecha del título"    value={fmtFecha(de.fecha_titulo)} />
            </div>
          </div>
        </div>

        {okMsg && (
          <div className="flex items-center gap-2 bg-[#E8F5EE] border border-[#1D6A4A]/30 rounded-xl px-4 py-3">
            <span className="text-[#1D6A4A] font-bold">✓</span>
            <p className="text-sm font-medium text-[#1D6A4A]">{okMsg}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Edición ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Header formulario */}
      <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Editar mi perfil</p>
          <p className="text-[11px] text-white/50">Los datos académicos se pre-rellenan en tus solicitudes</p>
        </div>
        <button type="button" onClick={() => { setEditMode(false); setError(""); }}
          className="text-xs text-white/60 hover:text-white transition">
          ✕ Cancelar
        </button>
      </div>

      <form id="perfil-edit-form" onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <span className="text-red-500 text-xs">⚠</span>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* ── Datos personales ── */}
        <div>
          <SecLabel>Datos personales</SecLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <FL>Nombre completo</FL>
              <TI name="nombre" value={form.nombre} onChange={handleChange} placeholder="María García" />
            </div>
            <div className="sm:col-span-2">
              <FL>Email <span className="font-normal text-neutral-400">(no editable)</span></FL>
              <TI name="email" value={user.email_contacto || ""} disabled />
            </div>
            <div>
              <FL opt>Fecha de nacimiento</FL>
              <TI name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" />
            </div>
            <div>
              <FL opt>Nacionalidad</FL>
              <TI name="nacionalidad" value={form.nacionalidad} onChange={handleChange} placeholder="Peruana" />
            </div>
            <div>
              <FL opt>Ciudad</FL>
              <TI name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
            </div>
            <div>
              <FL>País de origen</FL>
              <Combobox
                value={form.pais_origen}
                onChange={p => handlePaisChange(typeof p === "string" ? p : p.nombre)}
                options={PAISES}
                placeholder="Busca tu país…"
                getLabel={p => {
                  if (typeof p === "string") {
                    const f = PAISES.find(x => x.nombre === p);
                    return f ? `${f.emoji} ${f.nombre}` : p;
                  }
                  return `${p.emoji} ${p.nombre}`;
                }}
                renderOption={p => (
                  <span className="flex items-center gap-2">
                    <span>{p.emoji}</span><span>{p.nombre}</span>
                    <span className="ml-auto text-neutral-400 text-xs">{p.prefijo}</span>
                  </span>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Contacto ── */}
        <div>
          <SecLabel>Contacto</SecLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FL opt>Teléfono</FL>
              <TelefonoInput
                prefijo={form.prefijo_telefono} numero={form.telefono_numero}
                onPrefijo={v => set("prefijo_telefono", v)} onNumero={v => set("telefono_numero", v)}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">WhatsApp</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer ml-auto">
                  <input type="checkbox" checked={form.mismo_whatsapp}
                    onChange={e => set("mismo_whatsapp", e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#1D6A4A]" />
                  <span className="text-xs text-neutral-500">Mismo que teléfono</span>
                </label>
              </div>
              {form.mismo_whatsapp
                ? <p className="text-xs text-neutral-400 italic py-2">Se usará el mismo número</p>
                : <TelefonoInput
                    prefijo={form.prefijo_whatsapp} numero={form.whatsapp_numero}
                    onPrefijo={v => set("prefijo_whatsapp", v)} onNumero={v => set("whatsapp_numero", v)}
                  />
              }
            </div>
          </div>
        </div>

        {/* ── Documentos ── */}
        <div>
          <SecLabel>Documentos de identidad</SecLabel>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <FL opt>DNI / NIE / Cédula</FL>
              <TI name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" />
            </div>
            <div>
              <FL opt>DNI — Emisión</FL>
              <TI name="dni_emision" value={form.dni_emision} onChange={handleChange} type="date" />
            </div>
            <div>
              <FL opt>DNI — Vencimiento</FL>
              <TI name="dni_vencimiento" value={form.dni_vencimiento} onChange={handleChange} type="date" />
            </div>
            <div>
              <FL opt>Nº Pasaporte</FL>
              <TI name="pasaporte" value={form.pasaporte} onChange={handleChange} placeholder="AB123456" />
            </div>
            <div>
              <FL opt>Pasaporte — Emisión</FL>
              <TI name="pasaporte_emision" value={form.pasaporte_emision} onChange={handleChange} type="date" />
            </div>
            <div>
              <FL opt>Pasaporte — Vencimiento</FL>
              <TI name="pasaporte_vencimiento" value={form.pasaporte_vencimiento} onChange={handleChange} type="date" />
            </div>
          </div>
        </div>

        {/* ── Datos académicos ── */}
        <div>
          <SecLabel>Datos académicos</SecLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            <div>
              <FL opt>Carrera / Título</FL>
              <TI name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange}
                placeholder="Ej: Ingeniería Industrial" />
            </div>
            <div>
              <FL opt>Área de estudio</FL>
              <select value={form.area_carrera} onChange={e => set("area_carrera", e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition">
                <option value="">— Selecciona —</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <FL opt>Inicio de estudios</FL>
              <TI name="inicio_estudios" value={form.inicio_estudios} onChange={handleChange} placeholder="2018" />
            </div>
            <div>
              <FL opt>Fin de estudios</FL>
              <TI name="fin_estudios" value={form.fin_estudios} onChange={handleChange} placeholder="2023" />
            </div>
            <div>
              <FL opt>Fecha del título</FL>
              <TI name="fecha_titulo" value={form.fecha_titulo} onChange={handleChange} type="date" />
            </div>
          </div>
          <div>
            <FL opt>Universidad de origen</FL>
            <Combobox
              value={form.universidad_origen}
              onChange={v => set("universidad_origen", v)}
              options={UNIS}
              placeholder="Busca tu universidad o escribe el nombre…"
              allowCustom
            />
          </div>
        </div>

      </form>

      {/* Pie */}
      <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-end gap-3 bg-neutral-50 rounded-b-2xl">
        <button type="button" onClick={() => { setEditMode(false); setError(""); setOkMsg(""); }}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-white transition">
          Cancelar
        </button>
        <button type="submit" form="perfil-edit-form" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition">
          {saving
            ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
            : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>Guardar cambios</>
          }
        </button>
      </div>
    </div>
  );
}
