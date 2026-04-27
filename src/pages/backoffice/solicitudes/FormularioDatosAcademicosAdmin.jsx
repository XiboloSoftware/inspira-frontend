// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx
import { FIELD_CONFIG, SECTIONS_ORDER } from "./formularioDatosConfig";

function asBooleanLike(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (["si", "sí", "yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "false", "0"].includes(v)) return false;
  return null;
}

function BoolBadge({ value }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${value ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-50 text-neutral-500 border border-neutral-100"}`}>
      {value ? "Sí" : "No"}
    </span>
  );
}

function renderValor(value, field) {
  if (typeof value === "boolean") return <BoolBadge value={value} />;
  const boolLike = asBooleanLike(value);
  if (boolLike !== null) return <BoolBadge value={boolLike} />;
  if (value === null || value === undefined || value === "") return <span className="text-[11px] text-neutral-400">—</span>;

  const val = field?.format ? field.format(value) : value;
  if (typeof val === "object") return <span className="text-[11px] text-neutral-800">{JSON.stringify(val)}</span>;
  return <span className="text-[11px] text-neutral-800">{String(val)}</span>;
}

export default function FormularioDatosAcademicosAdmin({ datos }) {
  if (!datos || Object.keys(datos).length === 0) {
    return <p className="text-sm text-neutral-500">El cliente aún no ha completado el formulario de datos académicos.</p>;
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

  return (
    <div className="space-y-4">
      {SECTIONS_ORDER.filter((section) => grouped[section]).map((section) => (
        <div key={section} className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">{section}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {grouped[section].map((field) => (
              <div key={field.key} className={`flex justify-between gap-3 border-b border-neutral-100 pb-1 ${field.fullWidth ? "sm:col-span-2" : ""}`}>
                <span className="text-[11px] text-neutral-600">{field.label}</span>
                <div className="text-right max-w-md">{renderValor(field.value, field)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
