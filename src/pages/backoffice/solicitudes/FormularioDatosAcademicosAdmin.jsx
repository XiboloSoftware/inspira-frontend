// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx
import { FIELD_CONFIG, SECTIONS_ORDER } from "./formularioDatosConfig";

const SECTION_STYLE = {
  "Perfil académico":                           { bg: "bg-blue-50",    text: "text-blue-800",   border: "border-blue-100",   bar: "bg-blue-400"   },
  "Experiencia profesional y vinculación":       { bg: "bg-violet-50",  text: "text-violet-800", border: "border-violet-100", bar: "bg-violet-400" },
  "Investigación y formación complementaria":    { bg: "bg-cyan-50",    text: "text-cyan-800",   border: "border-cyan-100",   bar: "bg-cyan-400"   },
  "Idiomas y certificaciones":                   { bg: "bg-emerald-50", text: "text-emerald-800",border: "border-emerald-100",bar: "bg-emerald-400"},
  "Idioma del máster que prefiere":              { bg: "bg-teal-50",    text: "text-teal-800",   border: "border-teal-100",   bar: "bg-teal-400"   },
  "Becas y ayudas económicas":                   { bg: "bg-amber-50",   text: "text-amber-800",  border: "border-amber-100",  bar: "bg-amber-400"  },
  "Preferencias del máster":                     { bg: "bg-orange-50",  text: "text-orange-800", border: "border-orange-100", bar: "bg-orange-400" },
  "Comentario especial":                         { bg: "bg-pink-50",    text: "text-pink-800",   border: "border-pink-100",   bar: "bg-pink-400"   },
  "Otros datos":                                 { bg: "bg-neutral-50", text: "text-neutral-700",border: "border-neutral-100",bar: "bg-neutral-400"},
};

function asBooleanLike(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (["si", "sí", "yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "false", "0"].includes(v)) return false;
  return null;
}

function BoolBadge({ value }) {
  if (value) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Sí
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-500 border border-neutral-200">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
      No
    </span>
  );
}

function FieldValue({ value, field }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-xs text-neutral-300 italic">—</span>;
  }
  if (typeof value === "boolean") return <BoolBadge value={value} />;
  const boolLike = asBooleanLike(value);
  if (boolLike !== null) return <BoolBadge value={boolLike} />;

  const formatted = field?.format ? field.format(value) : value;
  if (typeof formatted === "object") return <span className="text-xs font-medium text-neutral-800">{JSON.stringify(formatted)}</span>;

  const str = String(formatted);
  // Número puro → tabular, destacado
  if (/^\d+([.,]\d+)?$/.test(str.trim())) {
    return <span className="text-sm font-semibold text-neutral-900 tabular-nums">{str}</span>;
  }
  return <span className="text-xs font-medium text-neutral-800 text-right">{str}</span>;
}

function SeccionCard({ nombre, fields }) {
  const st = SECTION_STYLE[nombre] || SECTION_STYLE["Otros datos"];

  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
      {/* Cabecera de sección */}
      <div className={`px-4 py-2.5 flex items-center gap-2.5 ${st.bg} border-b ${st.border}`}>
        <span className={`w-1 h-4 rounded-full ${st.bar} shrink-0`} />
        <span className={`text-[11px] font-bold uppercase tracking-widest ${st.text}`}>{nombre}</span>
      </div>

      {/* Filas de campos */}
      <div className="divide-y divide-neutral-50 bg-white">
        {fields.map((field) =>
          field.fullWidth ? (
            <div key={field.key} className="px-4 py-3 space-y-1">
              <p className="text-[11px] text-neutral-400 font-medium">{field.label}</p>
              <p className="text-xs font-medium text-neutral-800 leading-relaxed">
                {field.value !== null && field.value !== undefined && field.value !== ""
                  ? String(field.format ? field.format(field.value) : field.value)
                  : <span className="text-neutral-300 italic">—</span>}
              </p>
            </div>
          ) : (
            <div key={field.key} className="px-4 py-2.5 flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500 leading-relaxed min-w-0 flex-1">{field.label}</span>
              <div className="shrink-0 text-right max-w-[55%]">
                <FieldValue value={field.value} field={field} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function FormularioDatosAcademicosAdmin({ datos }) {
  if (!datos || Object.keys(datos).length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-neutral-600">Formulario pendiente</p>
        <p className="text-xs text-neutral-400 mt-0.5">El cliente aún no ha completado el formulario de datos académicos.</p>
      </div>
    );
  }

  const knownKeys = new Set(Object.keys(FIELD_CONFIG));
  const grouped = {};

  Object.entries(FIELD_CONFIG).forEach(([key, cfg]) => {
    if (!(key in datos)) return;
    if (!grouped[cfg.section]) grouped[cfg.section] = [];
    grouped[cfg.section].push({ key, ...cfg, value: datos[key] });
  });

  const otros = Object.entries(datos)
    .filter(([k]) => !knownKeys.has(k))
    .map(([key, value]) => ({ key, label: key.replace(/_/g, " "), section: "Otros datos", value }));

  if (otros.length) {
    if (!grouped["Otros datos"]) grouped["Otros datos"] = [];
    grouped["Otros datos"].push(...otros);
  }

  const sections = SECTIONS_ORDER.filter((s) => grouped[s]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
      {sections.map((nombre) => (
        <SeccionCard key={nombre} nombre={nombre} fields={grouped[nombre]} />
      ))}
    </div>
  );
}
