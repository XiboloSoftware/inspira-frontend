// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx

const FIELD_CONFIG = {
  // Perfil cuantitativo
  promedio_peru: {
    label: "Promedio (Perú)",
    section: "Perfil cuantitativo",
  },
  ubicacion_grupo: {
    label: "Grupo / ranking universidad",
    section: "Perfil cuantitativo",
  },

  // Idiomas
  idioma_master_es: {
    label: "Idioma preferido del máster (ES)",
    section: "Idiomas",
  },
  idioma_master_ingles: {
    label: "Idioma preferido del máster (EN)",
    section: "Idiomas",
  },
  idioma_master_bilingue: {
    label: "¿Máster bilingüe?",
    section: "Idiomas",
  },
  ingles_situacion: {
    label: "Situación actual de inglés",
    section: "Idiomas",
  },
  ingles_uni_nivel: {
    label: "Nivel de inglés en la universidad",
    section: "Idiomas",
  },

  // Experiencia y formación
  experiencia_anios: {
    label: "Años de experiencia laboral",
    section: "Experiencia y formación",
  },
  experiencia_vinculada: {
    label: "Experiencia vinculada al área",
    section: "Experiencia y formación",
  },
  otra_maestria_tiene: {
    label: "¿Tiene otra maestría?",
    section: "Experiencia y formación",
  },
  formacion_otra_maestria: {
    label: "Detalle otra maestría / formación",
    section: "Experiencia y formación",
  },
  formacion_encuentros: {
    label: "Tipo de encuentros / modalidad",
    section: "Experiencia y formación",
  },
  investigacion_experiencia: {
    label: "Experiencia en investigación",
    section: "Experiencia y formación",
  },

  // Becas
  beca_desea: {
    label: "¿Desea postular a beca?",
    section: "Becas",
  },

  // Presupuesto y preferencias
  presupuesto_desde: {
    label: "Presupuesto mínimo (€)",
    section: "Presupuesto y preferencias",
  },
  presupuesto_hasta: {
    label: "Presupuesto máximo (€)",
    section: "Presupuesto y preferencias",
  },
  duracion_preferida: {
    label: "Duración preferida del máster",
    section: "Presupuesto y preferencias",
  },
  practicas_preferencia: {
    label: "Preferencia sobre prácticas",
    section: "Presupuesto y preferencias",
  },

  // Comentario final
  comentario_especial: {
    label: "Comentario especial",
    section: "Comentario adicional",
  },
};

const SECTIONS_ORDER = [
  "Perfil cuantitativo",
  "Idiomas",
  "Experiencia y formación",
  "Becas",
  "Presupuesto y preferencias",
  "Comentario adicional",
  "Otros datos",
];

function renderValor(value) {
  if (typeof value === "boolean") {
    return (
      <span
        className={
          "inline-flex px-2 py-0.5 rounded-full text-[10px] " +
          (value
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-neutral-50 text-neutral-500 border border-neutral-100")
        }
      >
        {value ? "Sí" : "No"}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-[11px] text-neutral-400">—</span>;
  }

  if (typeof value === "object") {
    return (
      <span className="text-[11px] text-neutral-800">
        {JSON.stringify(value)}
      </span>
    );
  }

  return <span className="text-[11px] text-neutral-800">{String(value)}</span>;
}

export default function FormularioDatosAcademicosAdmin({ datos }) {
  if (!datos || Object.keys(datos).length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        El cliente aún no ha completado el formulario de datos académicos.
      </p>
    );
  }

  const knownKeys = new Set(Object.keys(FIELD_CONFIG));

  const grouped = {};

  // Campos configurados
  Object.entries(FIELD_CONFIG).forEach(([key, cfg]) => {
    if (!(key in datos)) return;
    if (!grouped[cfg.section]) grouped[cfg.section] = [];
    grouped[cfg.section].push({ key, ...cfg, value: datos[key] });
  });

  // Campos no mapeados → "Otros datos"
  const otros = Object.entries(datos)
    .filter(([k]) => !knownKeys.has(k))
    .map(([key, value]) => ({
      key,
      label: key.replace(/_/g, " "),
      section: "Otros datos",
      value,
    }));

  if (otros.length) {
    if (!grouped["Otros datos"]) grouped["Otros datos"] = [];
    grouped["Otros datos"].push(...otros);
  }

  return (
    <div className="space-y-4">
      {SECTIONS_ORDER.filter((section) => grouped[section]).map((section) => (
        <div key={section} className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
            {section}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {grouped[section].map((field) => (
              <div
                key={field.key}
                className="flex justify-between gap-3 border-b border-neutral-100 pb-1"
              >
                <span className="text-[11px] text-neutral-600">
                  {field.label}
                </span>
                <div className="text-right">{renderValor(field.value)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
