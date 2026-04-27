// Configuración de campos del formulario de datos académicos
export const FIELD_CONFIG = {
  promedio_peru:               { label: "Promedio ponderado (escala 0–20, Perú)", section: "Perfil cuantitativo" },
  ubicacion_grupo:             { label: "¿Estuvo en tercio/quinto/décimo superior?", section: "Perfil cuantitativo",
                                 format: (v) => ({ tercio: "Tercio superior", quinto: "Quinto superior", decimo: "Décimo superior", ninguno: "No estuvo en ninguno" }[v] || v) },

  experiencia_anios:           { label: "Años de experiencia profesional", section: "Experiencia profesional y vinculación" },
  experiencia_vinculada:       { label: "¿La experiencia está vinculada a los másteres de interés?", section: "Experiencia profesional y vinculación" },
  experiencia_vinculada_detalle: { label: "Detalle de la experiencia vinculada", section: "Experiencia profesional y vinculación", fullWidth: true },
  otra_maestria_tiene:         { label: "¿Cuenta con otra maestría?", section: "Experiencia profesional y vinculación" },
  otra_maestria_detalle:       { label: "Nombre de la maestría y universidad", section: "Experiencia profesional y vinculación", fullWidth: true },

  investigacion_experiencia:   { label: "¿Tiene experiencia en investigación?", section: "Investigación y formación complementaria" },
  investigacion_detalle:       { label: "Detalle de publicaciones o grupos de investigación", section: "Investigación y formación complementaria", fullWidth: true },
  formacion_encuentros:        { label: "Formación complementaria (encuentros, escuelas de verano, etc.)", section: "Investigación y formación complementaria" },
  formacion_otra_maestria:     { label: "Otra formación complementaria relacionada con el máster", section: "Investigación y formación complementaria" },

  ingles_situacion:            { label: "Situación actual de inglés", section: "Idiomas y certificaciones",
                                 format: (v) => ({ uni: "Certificación de inglés emitida por mi universidad", intl: "Certificación internacional (IELTS, TOEFL, Cambridge, etc.)", inst: "Inglés de instituto (sin certificación oficial)", sabe_sin_cert: "Sé inglés pero aún no lo he certificado", no: "No tengo inglés" }[v] || v) },
  ingles_uni_nivel:            { label: "Nivel de inglés en la universidad", section: "Idiomas y certificaciones" },
  ingles_intl_tipo:            { label: "Tipo de certificación internacional", section: "Idiomas y certificaciones" },
  ingles_intl_puntaje:         { label: "Puntaje / nivel en certificación internacional", section: "Idiomas y certificaciones" },

  idioma_master_es:            { label: "Acepta máster solo en español", section: "Idioma del máster que prefiere" },
  idioma_master_bilingue:      { label: "Acepta máster bilingüe (español + inglés)", section: "Idioma del máster que prefiere" },
  idioma_master_ingles:        { label: "Acepta máster totalmente en inglés", section: "Idioma del máster que prefiere" },

  beca_desea:                  { label: "¿Desea postular a una beca o ayuda económica?", section: "Becas y ayudas económicas" },
  beca_completa:               { label: "Interés en becas completas", section: "Becas y ayudas económicas" },
  beca_parcial:                { label: "Interés en becas parciales / descuentos", section: "Becas y ayudas económicas" },
  beca_ayuda_uni:              { label: "Interés en ayudas de la propia universidad", section: "Becas y ayudas económicas" },

  duracion_preferida:          { label: "Duración máxima que prefiere para el máster", section: "Preferencias del máster",
                                 format: (v) => ({ "1": "Máximo 1 año", "2": "Máximo 2 años", "3": "Máximo 3 años", "4": "Programas más largos", indiferente: "Indiferente" }[v] || v) },
  practicas_preferencia:       { label: "Prácticas curriculares", section: "Preferencias del máster",
                                 format: (v) => ({ imprescindible: "Es imprescindible que el máster tenga prácticas", deseable: "Me gustaría que tenga prácticas, pero no es imprescindible", no_importante: "No es un criterio importante para mí" }[v] || v) },
  presupuesto_desde:           { label: "Presupuesto mínimo para la matrícula (solo estudios, €)", section: "Preferencias del máster" },
  presupuesto_hasta:           { label: "Presupuesto máximo para la matrícula (solo estudios, €)", section: "Preferencias del máster" },

  comentario_especial:         { label: "Comentario especial para IA / asesores", section: "Comentario especial", fullWidth: true },
};

export const SECTIONS_ORDER = [
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
