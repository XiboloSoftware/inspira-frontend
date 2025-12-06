// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx

// Mapeos de valores codificados -> textos legibles
const UBICACION_GRUPO_LABELS = {
  tercio: "Tercio superior",
  quinto: "Quinto superior",
  decimo: "Décimo superior",
  ninguno: "No estuvo en ninguno",
};

const DURACION_LABELS = {
  "1": "Máximo 1 año",
  "2": "Máximo 2 años",
  "3": "Máximo 3 años",
  "4": "Programas más largos",
  indiferente: "Indiferente",
};

const INGLES_SITUACION_LABELS = {
  uni: "Certificación de inglés emitida por mi universidad",
  intl: "Certificación internacional (IELTS, TOEFL, Cambridge, etc.)",
  inst: "Inglés de instituto (sin certificación oficial)",
  sabe_sin_cert: "Sé inglés pero aún no lo he certificado",
  no: "No tengo inglés",
};

const PRACTICAS_LABELS = {
  imprescindible: "Es imprescindible que el máster tenga prácticas",
  deseable: "Me gustaría que tenga prácticas, pero no es imprescindible",
  no_importante: "No es un criterio importante para mí",
};

// Config de campos conocidos
const FIELD_CONFIG = {
  // 3.1 Perfil cuantitativo
  promedio_peru: {
    label: "Promedio ponderado (escala 0–20, Perú)",
    section: "Perfil cuantitativo",
  },
  ubicacion_grupo: {
    label: "¿Estuvo en tercio/quinto/décimo superior?",
    section: "Perfil cuantitativo",
    format: (v) => UBICACION_GRUPO_LABELS[v] || v,
  },

  // 3.2 Experiencia y vinculación
  experiencia_anios: {
    label: "Años de experiencia profesional",
    section: "Experiencia profesional y vinculación",
  },
  experiencia_vinculada: {
    label: "¿La experiencia está vinculada a los másteres de interés?",
    section: "Experiencia profesional y vinculación",
  },
  experiencia_vinculada_detalle: {
    label: "Detalle de la experiencia vinculada",
    section: "Experiencia profesional y vinculación",
    fullWidth: true,
  },
  otra_maestria_tiene: {
    label: "¿Cuenta con otra maestría?",
    section: "Experiencia profesional y vinculación",
  },
  otra_maestria_detalle: {
    label: "Nombre de la maestría y universidad",
    section: "Experiencia profesional y vinculación",
    fullWidth: true,
  },

  // 3.3 Investigación y formación complementaria
  investigacion_experiencia: {
    label: "¿Tiene experiencia en investigación?",
    section: "Investigación y formación complementaria",
  },
  investigacion_detalle: {
    label: "Detalle de publicaciones o grupos de investigación",
    section: "Investigación y formación complementaria",
    fullWidth: true,
  },
  formacion_encuentros: {
    label: "Formación complementaria (encuentros, escuelas de verano, etc.)",
    section: "Investigación y formación complementaria",
  },
  formacion_otra_maestria: {
    label: "Otra formación complementaria relacionada con el máster",
    section: "Investigación y formación complementaria",
  },

  // 3.4 Idiomas y certificaciones
  ingles_situacion: {
    label: "Situación actual de inglés",
    section: "Idiomas y certificaciones",
    format: (v) => INGLES_SITUACION_LABELS[v] || v,
  },
  ingles_uni_nivel: {
    label: "Nivel de inglés en la universidad",
    section: "Idiomas y certificaciones",
  },
  ingles_intl_tipo: {
    label: "Tipo de certificación internacional",
    section: "Idiomas y certificaciones",
  },
  ingles_intl_puntaje: {
    label: "Puntaje / nivel en certificación internacional",
    section: "Idiomas y certificaciones",
  },

  // 3.5 Idioma del máster
  idioma_master_es: {
    label: "Acepta máster solo en español",
    section: "Idioma del máster que prefiere",
  },
  idioma_master_bilingue: {
    label: "Acepta máster bilingüe (español + inglés)",
    section: "Idioma del máster que prefiere",
  },
  idioma_master_ingles: {
    label: "Acepta máster totalmente en inglés",
    section: "Idioma del máster que prefiere",
  },

  // 3.5 Becas y ayudas económicas
  beca_desea: {
    label: "¿Desea postular a una beca o ayuda económica?",
    section: "Becas y ayudas económicas",
  },
  beca_completa: {
    label: "Interés en becas completas",
    section: "Becas y ayudas económicas",
  },
  beca_parcial: {
    label: "Interés en becas parciales / descuentos",
    section: "Becas y ayudas económicas",
  },
  beca_ayuda_uni: {
    label: "Interés en ayudas de la propia universidad",
    section: "Becas y ayudas económicas",
  },

  // 3.6 Preferencias del máster
  duracion_preferida: {
    label: "Duración máxima que prefiere para el máster",
    section: "Preferencias del máster",
    format: (v) => DURACION_LABELS[v] || v,
  },
  practicas_preferencia: {
    label: "Prácticas curriculares",
    section: "Preferencias del máster",
    format: (v) => PRACTICAS_LABELS[v] || v,
  },
  presupuesto_desde: {
    label: "Presupuesto mínimo para la matrícula (solo estudios, €)",
    section: "Preferencias del máster",
  },
  presupuesto_hasta: {
    label: "Presupuesto máximo para la matrícula (solo estudios, €)",
    section: "Preferencias del máster",
  },

  // 3.7 Comentario especial
  comentario_especial: {
    label: "Comentario especial para IA / asesores",
    section: "Comentario especial",
    fullWidth: true,
  },
};

const SECTIONS_ORDER = [
  "Perfil cuantitativo",
  "Experiencia profesional y vinculación",
  "Investigación y formación complementaria",
  "Idiomas y certificaciones",
  "Idioma del máster que prefiere",
  "Becas y ayudas económicas",
  "Preferencias del máster",
  "Comentario especial",
  "Otros datos",
];

// Detecta strings tipo "si"/"no" como booleanos
function asBooleanLike(value) {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  if (["si", "sí", "yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "false", "0"].includes(v)) return false;
  return null;
}

function renderValor(value, field) {
  // boolean real
  if (typeof value === "boolean") {
    const val = value;
    return (
      <span
        className={
          "inline-flex px-2 py-0.5 rounded-full text-[10px] " +
          (val
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-neutral-50 text-neutral-500 border border-neutral-100")
        }
      >
        {val ? "Sí" : "No"}
      </span>
    );
  }

  // boolean "si"/"no"
  const boolLike = asBooleanLike(value);
  if (boolLike !== null) {
    return (
      <span
        className={
          "inline-flex px-2 py-0.5 rounded-full text-[10px] " +
          (boolLike
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-neutral-50 text-neutral-500 border border-neutral-100")
        }
      >
        {boolLike ? "Sí" : "No"}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-[11px] text-neutral-400">—</span>;
  }

  let val = value;

  // Formateo específico según campo
  if (field?.format) {
    val = field.format(value);
  }

  if (typeof val === "object") {
    return (
      <span className="text-[11px] text-neutral-800">
        {JSON.stringify(val)}
      </span>
    );
  }

  return <span className="text-[11px] text-neutral-800">{String(val)}</span>;
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
                className={
                  "flex justify-between gap-3 border-b border-neutral-100 pb-1 " +
                  (field.fullWidth ? "sm:col-span-2" : "")
                }
              >
                <span className="text-[11px] text-neutral-600">
                  {field.label}
                </span>
                <div className="text-right max-w-md">
                  {renderValor(field.value, field)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
