import { useState, useRef, useEffect } from "react";
import SeccionPanel from "./SeccionPanel";

// ── Constantes ────────────────────────────────────────────────────────────────

const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho",                   label: "Derecho" },
  { value: "Ingeniería y Tecnología",   label: "Ingeniería / TI" },
  { value: "Ciencias Sociales",         label: "Ciencias Sociales" },
  { value: "Educación",                 label: "Educación" },
  { value: "Salud",                     label: "Salud" },
  { value: "Humanidades",               label: "Humanidades" },
  { value: "Medio Ambiente",            label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño",             label: "Arte y Diseño" },
  { value: "Otra",                      label: "Otra" },
];

const MASTERS_INTERES = [
  { value: "Administración de Empresas / MBA",   label: "Administración / MBA" },
  { value: "Marketing Digital y Comunicación",   label: "Marketing Digital" },
  { value: "Gestión de Proyectos",               label: "Gestión de Proyectos" },
  { value: "Recursos Humanos y Organización",    label: "Recursos Humanos" },
  { value: "Finanzas y Banca",                   label: "Finanzas y Banca" },
  { value: "Comercio Internacional",             label: "Comercio Internacional" },
  { value: "Derecho Internacional y RRII",       label: "Derecho Internacional" },
  { value: "Derecho de Empresa",                 label: "Derecho de Empresa" },
  { value: "Inteligencia Artificial y Data",     label: "IA / Data Science" },
  { value: "Ciberseguridad",                     label: "Ciberseguridad" },
  { value: "Ingeniería y Tecnología",            label: "Ingeniería" },
  { value: "Arquitectura y Urbanismo",           label: "Arquitectura / Urbanismo" },
  { value: "Salud Pública y Epidemiología",      label: "Salud Pública" },
  { value: "Psicología y Salud Mental",          label: "Psicología" },
  { value: "Educación y Docencia",               label: "Educación" },
  { value: "Medio Ambiente y Sostenibilidad",    label: "Medio Ambiente" },
  { value: "Ciencias Sociales y Cooperación",    label: "Ciencias Sociales" },
  { value: "Arte, Diseño y Comunicación Visual", label: "Arte y Diseño" },
  { value: "Humanidades e Historia",             label: "Humanidades" },
  { value: "No sé todavía / Estoy explorando",   label: "🤔 Aún explorando" },
];

const COMUNIDADES = [
  "Andalucía", "Madrid", "Cataluña", "Valencia",
  "Galicia", "Castilla y León", "País Vasco", "Navarra",
];

const UNIS_SUGERENCIAS = [
  "Universidad Nacional Mayor de San Marcos","Pontificia Universidad Católica del Perú",
  "Universidad de Lima","Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia","Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico","Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas","Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal","Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia","Universidad de los Andes",
  "Universidad de Antioquia","Pontificia Universidad Javeriana",
  "Universidad del Rosario","Universidad del Valle",
  "Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México","Instituto Politécnico Nacional",
  "Universidad de Guadalajara","Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla","Tecnológico de Monterrey",
  "Universidad de Buenos Aires","Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata","Universidad Nacional de Rosario",
  "Universidad de Chile","Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo","Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador","ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela","Universidad del Zulia",
  "Universidad Mayor de San Andrés","Universidad Nacional de Asunción",
  "Universidad de la República","Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala",
  "Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa","Universidade do Porto",
];

const AUIP_KEYS = [
  "universidad de lima","universidad lima","universidad nacional mayor de san marcos","san marcos","unmsm",
  "pontificia universidad católica del perú","pucp","católica del perú","universidad nacional de ingeniería","uni peru",
  "universidad peruana cayetano heredia","cayetano heredia","universidad nacional agraria la molina","la molina",
  "universidad de buenos aires","uba","universidad nacional de córdoba","unc argentina","universidad nacional de la plata","unlp",
  "universidad nacional de rosario","universidad de chile","pontificia universidad católica de chile","puc chile",
  "universidad nacional de colombia","unal","universidad de antioquia","universidad del valle","univalle",
  "universidad industrial de santander","uis","universidad de los andes colombia","universidad de costa rica","ucr",
  "universidad central del ecuador","espol","politécnica del litoral","universidad de cuenca",
  "universidad de el salvador","ues","universidad de san carlos","usac","universidad rafael landívar","url guatemala",
  "universidad nacional autónoma de honduras","unah","universidad nacional autónoma de méxico","unam",
  "instituto politécnico nacional","ipn","universidad de guadalajara","udg","universidad autónoma de nuevo león","uanl",
  "benemérita universidad autónoma de puebla","buap","universidad nacional autónoma de nicaragua","unan",
  "universidad de panamá","universidad nacional de asunción","una paraguay","universidad autónoma de santo domingo","uasd",
  "universidad de la república","udelar","universidad central de venezuela","ucv","universidad del zulia","luz",
  "universidade de são paulo","usp","universidade federal do rio de janeiro","ufrj","universidade estadual de campinas","unicamp",
  "universidade de lisboa","universidade do porto",
];

const STEPS = [
  { label: "Carrera",       title: "Tu carrera universitaria",         icon: "🎓" },
  { label: "Universidad",   title: "Tu universidad y promedio",         icon: "🏛️" },
  { label: "Experiencia",   title: "Experiencia profesional",           icon: "💼" },
  { label: "Investigación", title: "Investigación y formación",         icon: "🔬" },
  { label: "Inglés",        title: "Certificación de inglés",           icon: "🗣️" },
  { label: "Idioma/Becas",  title: "Idioma del máster y becas",         icon: "💸" },
  { label: "Tipo máster",   title: "¿Qué tipo de máster?",             icon: "🎯" },
  { label: "Detalles",      title: "Duración, prácticas y presupuesto", icon: "📋" },
  { label: "Final",         title: "Comunidades y comentario final",    icon: "📍" },
];

const PRES_MIN = 500, PRES_MAX = 15000;

// ── Utilidades ────────────────────────────────────────────────────────────────

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function detectarAuip(texto) {
  const val = norm(texto);
  if (val.length < 4) return null;
  const found = AUIP_KEYS.some((k) => {
    const kn = norm(k);
    if (kn.length < 5) return false;
    const esc = kn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|\\s)" + esc + "(\\s|$)").test(val);
  });
  if (found) return "si";
  if (val.length >= 6) return "no_detectado";
  return null;
}

// Devuelve los campos requeridos faltantes para cada paso
function validateStep(s, formData) {
  const missing = [];
  switch (s) {
    case 0:
      if (!formData.carrera_titulo?.trim()) missing.push("carrera_titulo");
      if (!formData.area_carrera)           missing.push("area_carrera");
      break;
    case 1:
      if (!formData.universidad_origen?.trim()) missing.push("universidad_origen");
      if (!formData.promedio_peru)              missing.push("promedio_peru");
      if (!formData.ubicacion_grupo)            missing.push("ubicacion_grupo");
      if (!formData.otra_maestria_tiene)        missing.push("otra_maestria_tiene");
      break;
    case 2:
      if (!formData.experiencia_anios) missing.push("experiencia_anios");
      // Solo pide vinculación si tiene experiencia
      if (formData.experiencia_anios && formData.experiencia_anios !== "sin") {
        if (!formData.experiencia_vinculada) missing.push("experiencia_vinculada");
      }
      break;
    case 3:
      if (!formData.investigacion_experiencia) missing.push("investigacion_experiencia");
      break;
    case 4:
      if (!formData.ingles_situacion) missing.push("ingles_situacion");
      if (formData.ingles_situacion === "uni"  && !formData.ingles_uni_nivel)  missing.push("ingles_uni_nivel");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_tipo)  missing.push("ingles_intl_tipo");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_puntaje?.trim()) missing.push("ingles_intl_puntaje");
      break;
    case 5:
      if (!formData.idioma_master_es && !formData.idioma_master_bilingue && !formData.idioma_master_ingles)
        missing.push("idioma_master");
      if (!formData.beca_desea) missing.push("beca_desea");
      break;
    case 6:
      if (!formData.area_interes_master) missing.push("area_interes_master");
      break;
    case 7:
      if (!formData.duracion_preferida)    missing.push("duracion_preferida");
      if (!formData.practicas_preferencia) missing.push("practicas_preferencia");
      break;
    case 8:
      // Comunidades y comentario son opcionales
      break;
    default:
      break;
  }
  return missing;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Pill({ active, onClick, children, wide = false, error = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${wide ? "w-full text-left" : ""} ${
        active
          ? "bg-[#023A4B] text-white border-[#023A4B] shadow-sm"
          : error
          ? "border-red-300 text-neutral-700 bg-white hover:border-red-400"
          : "border-neutral-200 text-neutral-700 hover:border-[#023A4B] hover:text-[#023A4B] bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ children, required = true }) {
  return (
    <p className="text-sm font-semibold text-neutral-800 mb-3">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </p>
  );
}

function Hint({ children }) {
  return <p className="text-xs text-neutral-400 mt-1.5">{children}</p>;
}

function ErrorMsg({ show, children = "Selecciona una opción para continuar" }) {
  if (!show) return null;
  return <p className="text-xs text-red-500 mt-2 flex items-center gap-1">⚠ {children}</p>;
}

function Input({ value, onChange, placeholder, type = "text", hasError = false, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 transition ${
        hasError
          ? "border-red-400 focus:ring-red-200 focus:border-red-400"
          : "border-neutral-200 focus:ring-[#023A4B]/20 focus:border-[#023A4B]"
      }`}
      {...rest}
    />
  );
}

function WideBtn({ active, onClick, children, error = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
        active
          ? "bg-[#023A4B] text-white border-[#023A4B] shadow-sm"
          : error
          ? "border-red-300 text-neutral-700 hover:border-red-400 bg-white"
          : "border-neutral-200 text-neutral-700 hover:border-[#023A4B] hover:text-[#023A4B] bg-white"
      }`}
    >
      {active && <span className="float-right opacity-70">✓</span>}
      {children}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FormularioDatosAcademicos({
  formData, setFormData, handleSubmitFormulario,
  savingForm, hasData,
}) {
  const [step, setStep]           = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  // Universidad autocomplete
  const [uniQ, setUniQ]         = useState(formData.universidad_origen || "");
  const [showSugg, setShowSugg] = useState(false);
  const [auip, setAuip]         = useState(() => detectarAuip(formData.universidad_origen || ""));
  const uniWrap = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (uniWrap.current && !uniWrap.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Resetear errores al cambiar de paso
  useEffect(() => { setShowErrors(false); }, [step]);

  function set(key, val) { setFormData((p) => ({ ...p, [key]: val })); }

  function handleUniChange(val) {
    setUniQ(val);
    set("universidad_origen", val);
    const det = detectarAuip(val);
    setAuip(det);
    if (det === "si") set("es_auip", "si");
    else if (det === "no_detectado") set("es_auip", "");
  }

  function selectSugerencia(uni) {
    setUniQ(uni); set("universidad_origen", uni);
    const det = detectarAuip(uni); setAuip(det);
    if (det === "si") set("es_auip", "si");
    setShowSugg(false);
  }

  function confirmarAuip(val) {
    setAuip(val); set("es_auip", val === "si" ? "si" : "no");
  }

  function handleNext() {
    const missing = validateStep(step, formData);
    if (missing.length > 0) { setShowErrors(true); return; }
    setStep((p) => Math.min(STEPS.length - 1, p + 1));
  }

  // Errores calculados del paso actual
  const stepErrors = showErrors ? validateStep(step, formData) : [];
  function has(field) { return stepErrors.includes(field); }

  const suggestions = uniQ.length >= 2
    ? UNIS_SUGERENCIAS.filter(u => norm(u).includes(norm(uniQ))).slice(0, 6)
    : [];

  const isLast   = step === STEPS.length - 1;
  const presMax  = Number(formData.presupuesto_hasta) || 3000;
  const presPct  = (((presMax - PRES_MIN) / (PRES_MAX - PRES_MIN)) * 100).toFixed(1);
  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];
  const tieneExp    = formData.experiencia_anios && formData.experiencia_anios !== "sin";

  // ── Renderizado de cada paso ──────────────────────────────────────────────

  function renderStep() {
    switch (step) {

      // ── PASO 1: Tu carrera ──────────────────────────────────────────────
      case 0: return (
        <div className="space-y-6">
          <div>
            <Label>Carrera o título universitario</Label>
            <Input
              value={formData.carrera_titulo || ""}
              onChange={(e) => set("carrera_titulo", e.target.value)}
              placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…"
              hasError={has("carrera_titulo")}
            />
            <ErrorMsg show={has("carrera_titulo")} children="Escribe el nombre de tu carrera" />
          </div>

          <div>
            <Label>¿A qué área pertenece tu carrera?</Label>
            <div className={`flex flex-wrap gap-2 p-2.5 rounded-xl transition ${has("area_carrera") ? "bg-red-50/60 border border-red-200" : ""}`}>
              {AREAS_CARRERA.map((a) => (
                <Pill key={a.value}
                  active={formData.area_carrera === a.value}
                  onClick={() => set("area_carrera", formData.area_carrera === a.value ? "" : a.value)}>
                  {a.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("area_carrera")} />
          </div>
        </div>
      );

      // ── PASO 2: Universidad y promedio ──────────────────────────────────
      case 1: return (
        <div className="space-y-6">
          {/* Universidad con autocomplete */}
          <div ref={uniWrap} className="relative">
            <Label>Universidad de origen</Label>
            <Input
              value={uniQ}
              onChange={(e) => { handleUniChange(e.target.value); setShowSugg(true); }}
              onFocus={() => { if (uniQ.length >= 2) setShowSugg(true); }}
              placeholder="Empieza a escribir… PUCP, UNMSM, UBA, UNAM…"
              autoComplete="off"
              hasError={has("universidad_origen")}
            />
            <Hint>Puedes usar abreviaturas. Si no aparece en la lista, escribe el nombre completo.</Hint>
            <ErrorMsg show={has("universidad_origen")} children="Escribe el nombre de tu universidad" />

            {showSugg && suggestions.length > 0 && (
              <ul className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((u) => (
                  <li key={u}>
                    <button type="button" onMouseDown={() => selectSugerencia(u)}
                      className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-[#023A4B]/5 hover:text-[#023A4B] transition-colors">
                      {u}
                    </button>
                  </li>
                ))}
                <li className="px-4 py-2 text-xs text-neutral-400 border-t italic">
                  No aparece → escribe el nombre y continúa igualmente
                </li>
              </ul>
            )}

            {auip === "si" && (
              <div className="mt-2 flex items-start gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                <span className="font-bold mt-0.5">✓</span>
                <span><strong>Universidad afiliada a AUIP.</strong> Amplía tus opciones de becas.</span>
              </div>
            )}
            {auip === "no_detectado" && (
              <div className="mt-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <p className="mb-2">⚠️ No encontramos tu universidad en la lista AUIP. <strong>¿Está afiliada?</strong></p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => confirmarAuip("si")}
                    className="px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition text-sm">
                    Sí, está afiliada
                  </button>
                  <button type="button" onClick={() => confirmarAuip("no")}
                    className="px-4 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 font-semibold hover:bg-neutral-200 transition text-sm">
                    No está afiliada
                  </button>
                </div>
              </div>
            )}
            {auip === "no" && (
              <div className="mt-2 flex items-center gap-2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500">
                <span>ℹ️</span>
                <span>No afiliada a AUIP.
                  <button type="button" onClick={() => setAuip("no_detectado")} className="ml-2 underline">Cambiar</button>
                </span>
              </div>
            )}
          </div>

          {/* Promedio + Escala */}
          <div>
            <Label>Promedio universitario</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.01" min="0"
                value={formData.promedio_peru || ""}
                onChange={(e) => set("promedio_peru", e.target.value.trim())}
                placeholder="Ej: 15.75"
                hasError={has("promedio_peru")}
              />
              <select
                value={formData.promedio_escala || "20"}
                onChange={(e) => set("promedio_escala", e.target.value)}
                className="w-44 sm:w-52 rounded-xl border border-neutral-200 px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition shrink-0">
                <option value="20">Escala /20 — Perú</option>
                <option value="10">Escala /10</option>
                <option value="5">Escala /5 — Colombia</option>
                <option value="4">GPA 0–4.0</option>
                <option value="100">Porcentaje %</option>
              </select>
            </div>
            <ErrorMsg show={has("promedio_peru")} children="Ingresa tu promedio universitario" />
          </div>

          {/* Ranking */}
          <div>
            <Label>¿Estuviste en tercio, quinto o décimo superior?</Label>
            <div className={`flex flex-wrap gap-2 p-2.5 rounded-xl transition ${has("ubicacion_grupo") ? "bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "tercio",  label: "Tercio superior" },
                { value: "quinto",  label: "Quinto superior" },
                { value: "decimo",  label: "Décimo superior" },
                { value: "ninguno", label: "No estuve en ninguno" },
              ].map((o) => (
                <Pill key={o.value}
                  active={formData.ubicacion_grupo === o.value}
                  onClick={() => set("ubicacion_grupo", formData.ubicacion_grupo === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("ubicacion_grupo")} />
          </div>

          {/* Otra maestría */}
          <div>
            <Label>¿Cuentas con otra maestría?</Label>
            <div className={`flex gap-2 ${has("otra_maestria_tiene") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {["si","no"].map((v) => (
                <Pill key={v}
                  active={formData.otra_maestria_tiene === v}
                  onClick={() => set("otra_maestria_tiene", v)}>
                  {v === "si" ? "Sí" : "No"}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("otra_maestria_tiene")} />
            {formData.otra_maestria_tiene === "si" && (
              <div className="mt-3">
                <Input value={formData.otra_maestria_detalle || ""}
                  onChange={(e) => set("otra_maestria_detalle", e.target.value)}
                  placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona" />
              </div>
            )}
          </div>
        </div>
      );

      // ── PASO 3: Experiencia profesional ─────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <Label>Años de experiencia profesional</Label>
            <div className={`flex flex-wrap gap-2 p-2.5 rounded-xl transition ${has("experiencia_anios") ? "bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "sin",  label: "Sin experiencia" },
                { value: "1-2",  label: "1–2 años" },
                { value: "2-3",  label: "2–3 años" },
                { value: "3-5",  label: "3–5 años" },
                { value: "5-10", label: "5–10 años" },
                { value: "10+",  label: "Más de 10 años" },
              ].map((o) => (
                <Pill key={o.value}
                  active={formData.experiencia_anios === o.value}
                  onClick={() => {
                    set("experiencia_anios", formData.experiencia_anios === o.value ? "" : o.value);
                    if (o.value === "sin") set("experiencia_vinculada", "no");
                  }}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("experiencia_anios")} />
          </div>

          {tieneExp && (
            <>
              <div>
                <Label>¿Tu experiencia está vinculada al área del máster de interés?</Label>
                <div className={`flex flex-col sm:flex-row gap-2 ${has("experiencia_vinculada") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
                  {[
                    { value: "si",     label: "Sí, está relacionada directamente" },
                    { value: "parcial",label: "Parcialmente relacionada" },
                    { value: "no",     label: "No directamente" },
                  ].map((o) => (
                    <Pill key={o.value}
                      active={formData.experiencia_vinculada === o.value}
                      onClick={() => set("experiencia_vinculada", formData.experiencia_vinculada === o.value ? "" : o.value)}>
                      {o.label}
                    </Pill>
                  ))}
                </div>
                <ErrorMsg show={has("experiencia_vinculada")} />
              </div>

              {(formData.experiencia_vinculada === "si" || formData.experiencia_vinculada === "parcial") && (
                <div>
                  <Label required={false}>Describe brevemente tu experiencia</Label>
                  <textarea rows={3}
                    value={formData.experiencia_vinculada_detalle || ""}
                    onChange={(e) => set("experiencia_vinculada_detalle", e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 transition"
                    placeholder="Empresa, cargo, sector…" />
                </div>
              )}

              <div>
                <Label required={false}>Sector o industria donde trabajas / trabajaste</Label>
                <Input
                  value={formData.experiencia_sector || ""}
                  onChange={(e) => set("experiencia_sector", e.target.value)}
                  placeholder="Ej: Consultoría, Salud pública, Tecnología, Banca…" />
              </div>
            </>
          )}
        </div>
      );

      // ── PASO 4: Investigación y formación ───────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <Label>¿Tienes experiencia en investigación?</Label>
            <div className={`flex flex-col sm:flex-row gap-2 ${has("investigacion_experiencia") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "si", label: "Sí, tengo publicaciones o grupos de investigación" },
                { value: "no", label: "No tengo experiencia en investigación" },
              ].map((o) => (
                <Pill key={o.value} wide
                  active={formData.investigacion_experiencia === o.value}
                  onClick={() => set("investigacion_experiencia", formData.investigacion_experiencia === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("investigacion_experiencia")} />
            {formData.investigacion_experiencia === "si" && (
              <textarea rows={2}
                value={formData.investigacion_detalle || ""}
                onChange={(e) => set("investigacion_detalle", e.target.value)}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 transition"
                placeholder="Publicaciones, grupos de investigación, proyectos…" />
            )}
          </div>

          <div>
            <Label required={false}>Formación complementaria relacionada con el máster</Label>
            <p className="text-xs text-neutral-400 mb-3">Opcional. Marca todo lo que aplique.</p>
            <div className="flex flex-col gap-2">
              {[
                { key: "formacion_diplomados",    label: "Diplomados, cursos o seminarios relacionados" },
                { key: "formacion_encuentros",    label: "Encuentros, escuelas de verano o congresos" },
                { key: "formacion_otros",         label: "Otros (especificar)" },
              ].map(({ key, label }) => (
                <WideBtn key={key} active={!!formData[key]}
                  onClick={() => set(key, !formData[key])}>
                  {label}
                </WideBtn>
              ))}
            </div>
            {formData.formacion_otros && (
              <input type="text"
                value={formData.formacion_otros_detalle || ""}
                onChange={(e) => set("formacion_otros_detalle", e.target.value)}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 transition"
                placeholder="Describe brevemente…" />
            )}
          </div>
        </div>
      );

      // ── PASO 5: Inglés ──────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-6">
          <div>
            <Label>Situación actual de inglés</Label>
            <div className={`flex flex-col gap-2 ${has("ingles_situacion") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "intl",          label: "Tengo certificación internacional (IELTS, TOEFL, Cambridge…)" },
                { value: "uni",           label: "Tengo certificación de mi universidad" },
                { value: "instituto",     label: "Tengo inglés de instituto (sin certificación oficial)" },
                { value: "sabe_sin_cert", label: "Sé inglés pero aún no lo he certificado" },
                { value: "no",            label: "No tengo inglés" },
              ].map((o) => (
                <WideBtn key={o.value}
                  active={formData.ingles_situacion === o.value}
                  onClick={() => set("ingles_situacion", formData.ingles_situacion === o.value ? "" : o.value)}>
                  {o.label}
                </WideBtn>
              ))}
            </div>
            <ErrorMsg show={has("ingles_situacion")} />
          </div>

          {formData.ingles_situacion === "uni" && (
            <div>
              <Label>Nivel certificado por tu universidad</Label>
              <div className={`flex flex-wrap gap-2 ${has("ingles_uni_nivel") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
                {["B1","B2","C1","C2","Otro"].map((n) => (
                  <Pill key={n} active={formData.ingles_uni_nivel === n}
                    onClick={() => set("ingles_uni_nivel", formData.ingles_uni_nivel === n ? "" : n)}>
                    {n}
                  </Pill>
                ))}
              </div>
              <ErrorMsg show={has("ingles_uni_nivel")} />
            </div>
          )}

          {formData.ingles_situacion === "intl" && (
            <div className="space-y-4">
              <div>
                <Label>Tipo de certificación</Label>
                <div className={`flex flex-wrap gap-2 ${has("ingles_intl_tipo") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
                  {["IELTS","TOEFL","Cambridge","Duolingo English Test","Otro"].map((t) => (
                    <Pill key={t} active={formData.ingles_intl_tipo === t}
                      onClick={() => set("ingles_intl_tipo", formData.ingles_intl_tipo === t ? "" : t)}>
                      {t}
                    </Pill>
                  ))}
                </div>
                <ErrorMsg show={has("ingles_intl_tipo")} />
              </div>
              <div>
                <Label>Puntaje o nivel obtenido</Label>
                <Input value={formData.ingles_intl_puntaje || ""}
                  onChange={(e) => set("ingles_intl_puntaje", e.target.value)}
                  placeholder="Ej: 6.5 (IELTS), 90 (TOEFL), C1 (Cambridge)"
                  hasError={has("ingles_intl_puntaje")} />
                <ErrorMsg show={has("ingles_intl_puntaje")} children="Ingresa tu puntaje o nivel" />
              </div>
            </div>
          )}

          {formData.ingles_situacion === "instituto" && (
            <div>
              <Label required={false}>Nivel aproximado de inglés</Label>
              <div className="flex flex-wrap gap-2">
                {["A2","B1","B2","No lo sé"].map((n) => (
                  <Pill key={n} active={formData.ingles_instituto_nivel === n}
                    onClick={() => set("ingles_instituto_nivel", formData.ingles_instituto_nivel === n ? "" : n)}>
                    {n}
                  </Pill>
                ))}
              </div>
              <Hint>Los másteres en español suelen requerir al menos B1 para el proceso de admisión.</Hint>
            </div>
          )}
        </div>
      );

      // ── PASO 6: Idioma del máster y becas ───────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <Label>Idioma del máster que aceptas</Label>
            <p className="text-xs text-neutral-400 mb-3">Puedes marcar varios.</p>
            <div className={`flex flex-col gap-2 ${has("idioma_master") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { key: "idioma_master_es",       label: "Solo en español" },
                { key: "idioma_master_bilingue",  label: "Bilingüe (español + inglés)" },
                { key: "idioma_master_ingles",    label: "Totalmente en inglés" },
              ].map(({ key, label }) => (
                <WideBtn key={key} active={!!formData[key]}
                  onClick={() => set(key, !formData[key])}>
                  {label}
                </WideBtn>
              ))}
            </div>
            <ErrorMsg show={has("idioma_master")} children="Selecciona al menos un idioma" />
          </div>

          <div>
            <Label>¿Deseas postular a una beca o ayuda económica?</Label>
            <div className={`flex gap-2 ${has("beca_desea") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "si", label: "Sí, me interesa" },
                { value: "no", label: "No por ahora" },
              ].map((o) => (
                <Pill key={o.value} active={formData.beca_desea === o.value}
                  onClick={() => set("beca_desea", formData.beca_desea === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("beca_desea")} />

            {formData.beca_desea === "si" && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-neutral-500 mb-1">¿Qué tipo de becas te interesan?</p>
                {[
                  { key: "beca_completa",  label: "🎓 Becas completas (matrícula cubierta)" },
                  { key: "beca_parcial",   label: "💸 Becas parciales / descuentos" },
                  { key: "beca_ayuda_uni", label: "🏛️ Ayudas de la propia universidad" },
                  { key: "beca_auip",      label: "🌐 Becas AUIP (si aplica por tu universidad)" },
                ].map(({ key, label }) => (
                  <WideBtn key={key} active={!!formData[key]}
                    onClick={() => set(key, !formData[key])}>
                    {label}
                  </WideBtn>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      // ── PASO 7: Tipo de máster ──────────────────────────────────────────
      case 6: return (
        <div>
          <Label>¿Qué tipo de máster te interesa estudiar?</Label>
          <p className="text-xs text-neutral-400 mb-3">
            Puede ser diferente a tu carrera. Ej: Ingeniería → Gestión de Proyectos.
          </p>
          <div className={`flex flex-wrap gap-2 ${has("area_interes_master") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
            {MASTERS_INTERES.map((m) => (
              <button key={m.value} type="button"
                onClick={() => set("area_interes_master", formData.area_interes_master === m.value ? "" : m.value)}
                className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
                  formData.area_interes_master === m.value
                    ? "bg-[#023A4B] text-white border-[#023A4B] shadow-sm"
                    : "border-neutral-200 text-neutral-700 hover:border-[#023A4B] hover:text-[#023A4B] bg-white"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
          <ErrorMsg show={has("area_interes_master")} children="Selecciona el tipo de máster de tu interés" />
        </div>
      );

      // ── PASO 8: Duración, prácticas y presupuesto ───────────────────────
      case 7: return (
        <div className="space-y-6">
          <div>
            <Label>Duración máxima que prefieres</Label>
            <div className={`flex flex-wrap gap-2 ${has("duracion_preferida") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "indiferente", label: "Me da igual (1–2 años)" },
                { value: "1",          label: "Máx. 1 año (~60 ECTS)" },
                { value: "1.5",        label: "Máx. 1,5 años" },
                { value: "2",          label: "Máx. 2 años" },
              ].map((o) => (
                <Pill key={o.value}
                  active={formData.duracion_preferida === o.value}
                  onClick={() => set("duracion_preferida", formData.duracion_preferida === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <ErrorMsg show={has("duracion_preferida")} />
          </div>

          <div>
            <Label>Prácticas curriculares</Label>
            <Hint className="mb-2">Las prácticas en España equivalen a tu primera experiencia laboral europea.</Hint>
            <div className={`flex flex-col gap-2 mt-2 ${has("practicas_preferencia") ? "p-2.5 rounded-xl bg-red-50/60 border border-red-200" : ""}`}>
              {[
                { value: "imprescindible", label: "Imprescindible que tenga prácticas" },
                { value: "deseable",       label: "Me gustaría, pero no es obligatorio" },
                { value: "no_importante",  label: "No es un criterio para mí" },
              ].map((o) => (
                <WideBtn key={o.value}
                  active={formData.practicas_preferencia === o.value}
                  onClick={() => set("practicas_preferencia", formData.practicas_preferencia === o.value ? "" : o.value)}>
                  {o.label}
                </WideBtn>
              ))}
            </div>
            <ErrorMsg show={has("practicas_preferencia")} />
          </div>

          <div>
            <Label>¿Cuánto puedes invertir en matrícula por año?</Label>
            <div className="text-3xl font-bold text-[#023A4B] mb-4">
              {presMax.toLocaleString("es-ES")} €
            </div>
            <input type="range"
              min={PRES_MIN} max={PRES_MAX} step="250" value={presMax}
              onChange={(e) => set("presupuesto_hasta", e.target.value)}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer outline-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#023A4B] [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#023A4B]
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              style={{ background: `linear-gradient(to right, #023A4B 0%, #023A4B ${presPct}%, #e5e7eb ${presPct}%, #e5e7eb 100%)` }}
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>500 €</span><span>7.500 €</span><span>15.000 €</span>
            </div>
            <Hint>Solo tasas universitarias. No incluye alojamiento ni manutención.</Hint>
          </div>

          <div>
            <Label required={false}>Modalidad preferida</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "presencial",    label: "Presencial" },
                { value: "semipresencial",label: "Semipresencial" },
                { value: "online",        label: "Online" },
                { value: "indiferente",   label: "Me da igual" },
              ].map((o) => (
                <Pill key={o.value}
                  active={formData.modalidad_preferida === o.value}
                  onClick={() => set("modalidad_preferida", formData.modalidad_preferida === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      );

      // ── PASO 9: Comunidades y comentario final ──────────────────────────
      case 8: return (
        <div className="space-y-6">
          <div>
            <Label required={false}>¿Tienes alguna comunidad autónoma preferida en España?</Label>
            <p className="text-xs text-neutral-400 mb-3">Opcional. Puedes seleccionar varias.</p>
            <div className="grid grid-cols-2 gap-2">
              {COMUNIDADES.map((c) => (
                <button key={c} type="button"
                  onClick={() => {
                    const next = comunidades.includes(c)
                      ? comunidades.filter(x => x !== c)
                      : [...comunidades, c];
                    set("comunidades_preferidas", next);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                    comunidades.includes(c)
                      ? "bg-[#023A4B]/8 border-[#023A4B] text-[#023A4B]"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
                  }`}>
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    comunidades.includes(c) ? "bg-[#023A4B] border-[#023A4B]" : "border-neutral-300"
                  }`}>
                    {comunidades.includes(c) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label required={false}>¿Cuándo planeas empezar el máster?</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "sep_2025", label: "Sep 2025" },
                { value: "ene_2026", label: "Ene 2026" },
                { value: "sep_2026", label: "Sep 2026" },
                { value: "flexible", label: "Flexible / Por definir" },
              ].map((o) => (
                <Pill key={o.value}
                  active={formData.inicio_previsto === o.value}
                  onClick={() => set("inicio_previsto", formData.inicio_previsto === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <Label required={false}>Comentario especial para la IA y tus asesores</Label>
            <p className="text-xs text-neutral-400 mb-3">
              Situación familiar, si quieres hacer doctorado, restricciones geográficas, plazo límite… Todo ayuda.
            </p>
            <textarea rows={5}
              value={formData.comentario_especial || ""}
              onChange={(e) => set("comentario_especial", e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#023A4B]/20 focus:border-[#023A4B] transition"
              placeholder="Escribe aquí cualquier detalle relevante…" />
          </div>
        </div>
      );

      default: return null;
    }
  }

  // ── Render principal ────────────────────────────────────────────────────────

  const estado    = hasData ? "completado" : "pendiente";
  const subtitulo = hasData
    ? "Ya tienes datos guardados. Haz clic para revisar o modificar."
    : "Completa este formulario para personalizar tu informe de búsqueda.";

  const stepHasErrors = showErrors && validateStep(step, formData).length > 0;

  return (
    <SeccionPanel
      numero="3"
      titulo="Formulario de datos académicos"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="3"
    >
      <form onSubmit={handleSubmitFormulario}>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#023A4B]">
              Paso {step + 1} / {STEPS.length} — {STEPS[step].title}
            </span>
            <span className="text-xs text-neutral-400">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full">
            <div
              className="h-1.5 bg-[#023A4B] rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Círculos de navegación */}
        <div className="hidden sm:flex items-center mb-5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button type="button" onClick={() => setStep(i)} title={s.title}
                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold transition-all ${
                  i < step ? "bg-emerald-500 text-white"
                  : i === step ? "bg-[#023A4B] text-white ring-4 ring-[#023A4B]/15 shadow"
                  : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                }`}>
                {i < step ? "✓" : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-400" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card del paso */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm mb-4">
          <div className="px-4 sm:px-5 py-3.5 border-b border-neutral-100 bg-gradient-to-r from-[#023A4B]/6 to-transparent flex items-center gap-2.5">
            <span className="text-xl flex-shrink-0">{STEPS[step].icon}</span>
            <h3 className="text-sm font-bold text-[#023A4B]">{STEPS[step].title}</h3>
          </div>
          <div className="px-4 sm:px-5 py-5">
            {renderStep()}
          </div>
        </div>

        {/* Banner de error */}
        {stepHasErrors && (
          <div className="flex items-center gap-2.5 px-4 py-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <span className="text-base shrink-0">⚠</span>
            <span>Completa todos los campos requeridos antes de continuar.</span>
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between">
          <button type="button"
            onClick={() => setStep(p => Math.max(0, p - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-30 hover:bg-neutral-50 transition active:scale-95">
            ← Anterior
          </button>

          {!isLast && (
            <button type="button" onClick={handleNext}
              className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] transition-all active:scale-95 shadow-sm">
              Continuar →
            </button>
          )}
          {isLast && (
            <button type="submit" disabled={savingForm}
              className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition-all active:scale-95 shadow-sm">
              {savingForm
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
                : "✓ Guardar formulario"
              }
            </button>
          )}
        </div>
      </form>
    </SeccionPanel>
  );
}
