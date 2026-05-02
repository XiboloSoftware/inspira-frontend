// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx
import { FIELD_CONFIG, SECTIONS_ORDER } from "./formularioDatosConfig";

const SECTION_CFG = {
  "Perfil académico":          { icon: "🎓", color: "blue"    },
  "Experiencia profesional":   { icon: "💼", color: "violet"  },
  "Investigación y formación": { icon: "🔬", color: "cyan"    },
  "Idiomas":                   { icon: "🗣️",  color: "emerald" },
  "Becas":                     { icon: "💸", color: "amber"   },
  "Preferencias del máster":   { icon: "🎯", color: "orange"  },
  "Comentario especial":       { icon: "💬", color: "pink"    },
  "Otros datos":               { icon: "📋", color: "neutral" },
};

const CLR = {
  blue:    { h: "bg-blue-50 border-blue-100",      bar: "bg-blue-400",    t: "text-blue-700"    },
  violet:  { h: "bg-violet-50 border-violet-100",  bar: "bg-violet-400",  t: "text-violet-700"  },
  cyan:    { h: "bg-cyan-50 border-cyan-100",       bar: "bg-cyan-400",    t: "text-cyan-700"    },
  emerald: { h: "bg-emerald-50 border-emerald-100", bar: "bg-emerald-400", t: "text-emerald-700" },
  amber:   { h: "bg-amber-50 border-amber-100",     bar: "bg-amber-400",   t: "text-amber-700"   },
  orange:  { h: "bg-orange-50 border-orange-100",   bar: "bg-orange-400",  t: "text-orange-700"  },
  pink:    { h: "bg-pink-50 border-pink-100",       bar: "bg-pink-400",    t: "text-pink-700"    },
  neutral: { h: "bg-neutral-50 border-neutral-100", bar: "bg-neutral-300", t: "text-neutral-500" },
};

function toBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (["si","sí","yes","true"].includes(s)) return true;   // "1" excluido — puede ser un valor numérico
  if (["no","false"].includes(s)) return false;             // "0" excluido por la misma razón
  return null;
}

function Badge({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Sí
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-400 border border-neutral-200">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />No
    </span>
  );
}

function Val({ value, field, extra }) {
  // Vacío
  if (value === null || value === undefined || value === "")
    return <span className="text-[10px] text-neutral-300 italic">—</span>;

  // Boolean nativo siempre es badge
  if (typeof value === "boolean") return <Badge ok={value} />;

  // Si tiene format → aplicar PRIMERO (evita que "1", "2" etc. se lean como boolean)
  if (field?.format) {
    const formatted = field.format(value, extra);
    if (typeof formatted === "object")
      return <span className="text-[11px] text-neutral-600">{JSON.stringify(formatted)}</span>;
    const str = String(formatted);
    // Número con unidad (ej: "8.750 €/año", "16 / 20")
    if (/^[\d.,]+/.test(str.trim()))
      return <span className="text-xs font-bold text-neutral-900 tabular-nums">{str}</span>;
    return <span className="text-[11px] font-semibold text-neutral-800 text-right leading-snug">{str}</span>;
  }

  // Sin format → revisar si es bool-like
  const bool = toBool(value);
  if (bool !== null) return <Badge ok={bool} />;

  const str = String(value);
  if (/^\d+([.,]\d+)?$/.test(str.trim()))
    return <span className="text-xs font-bold text-neutral-900 tabular-nums">{str}</span>;

  return <span className="text-[11px] font-semibold text-neutral-800 text-right leading-snug">{str}</span>;
}

function SectionCard({ nombre, fields, extra }) {
  const cfg = SECTION_CFG[nombre] || SECTION_CFG["Otros datos"];
  const clr = CLR[cfg.color] || CLR.neutral;

  const inline    = fields.filter((f) => !f.fullWidth);
  const fullWidth = fields.filter((f) =>  f.fullWidth);

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-sm bg-white break-inside-avoid mb-3">
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${clr.h}`}>
        <span className={`w-0.5 h-3.5 rounded-full ${clr.bar} shrink-0`} />
        <span className="text-sm leading-none shrink-0">{cfg.icon}</span>
        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${clr.t}`}>{nombre}</span>
        <span className="ml-auto text-[9px] text-neutral-400 tabular-nums">{fields.length}</span>
      </div>

      {/* Inline rows */}
      {inline.length > 0 && (
        <div className="divide-y divide-neutral-50">
          {inline.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2 px-3 py-1.5 min-h-0">
              <span className="text-[10px] text-neutral-400 leading-tight flex-1 min-w-0">{f.label}</span>
              <div className="shrink-0 max-w-[56%] text-right">
                <Val value={f.value} field={f} extra={extra} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-width rows */}
      {fullWidth.map((f) => (
        <div key={f.key} className={`px-3 py-1.5 ${inline.length > 0 ? "border-t border-neutral-50" : ""}`}>
          <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mb-0.5">{f.label}</p>
          {f.value ? (
            <p className="text-[11px] font-medium text-neutral-800 leading-relaxed">
              {String(f.format ? f.format(f.value, extra) : f.value)}
            </p>
          ) : (
            <span className="text-[10px] text-neutral-300 italic">—</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FormularioDatosAcademicosAdmin({ datos }) {
  if (!datos || Object.keys(datos).length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-neutral-600">Formulario pendiente</p>
        <p className="text-xs text-neutral-400 mt-1">El cliente aún no ha completado el formulario académico.</p>
      </div>
    );
  }

  // Extra data passed to format functions (para combinar campos relacionados)
  const extra = { escala: datos.promedio_escala };

  const knownKeys = new Set(Object.keys(FIELD_CONFIG));
  knownKeys.add("promedio_escala"); // manejado via extra, no mostrar por separado

  const grouped = {};

  // Mostrar TODOS los campos del config, con "—" si no están en datos
  Object.entries(FIELD_CONFIG).forEach(([key, cfg]) => {
    if (!grouped[cfg.section]) grouped[cfg.section] = [];
    grouped[cfg.section].push({ key, ...cfg, value: datos[key] ?? null });
  });

  // Campos desconocidos → Otros datos
  const extras = Object.entries(datos).filter(([k]) => !knownKeys.has(k));
  if (extras.length) {
    if (!grouped["Otros datos"]) grouped["Otros datos"] = [];
    extras.forEach(([key, value]) =>
      grouped["Otros datos"].push({ key, label: key.replace(/_/g, " "), section: "Otros datos", value })
    );
  }

  const sections = SECTIONS_ORDER.filter((s) => grouped[s]);

  return (
    // CSS columns = masonry natural, sin huecos
    <div className="columns-1 sm:columns-2 xl:columns-3 gap-3">
      {sections.map((nombre) => (
        <SectionCard key={nombre} nombre={nombre} fields={grouped[nombre]} extra={extra} />
      ))}
    </div>
  );
}
