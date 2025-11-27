// src/pages/servicios/master/masterPlans.data.js

// “Oferta académica” – planes por listas (económicas / intermedias / premium)
export const masterAcademicSections = [
  {
    id: "lista1",
    title: "Universidades Económicas · Lista 1",
    subtitle:
      "Andalucía, Cantabria, Asturias, Castilla-La Mancha, Galicia y Castilla y León. Todos los planes incluyen la misma metodología; cambia la cobertura geográfica y n.º de universidades.",
    items: [
      {
        id: "lista1-plan-a-andalucia",
        badge: "Plan A · Andalucía",
        title: "Postulación en Andalucía",
        priceLabel: "219 €",
        subtitle:
          "Hasta 6 máster en hasta 10 universidades públicas andaluzas.",
        bullets: [
          "Búsqueda y filtrado de centros oficiales",
          "Postulación directa a másteres",
          "Seguimiento hasta obtener vacante",
        ],
      },
      {
        id: "lista1-plan-basico",
        badge: "Plan Básico",
        title: "Cantabria, Asturias o Castilla-La Mancha",
        priceLabel: "249 €",
        subtitle:
          "Postulación sin límite de máster ni universidades en UNA de estas comunidades.",
        bullets: [
          "Revisión completa de documentación",
          "Selección de instituciones económicas",
        ],
      },
      {
        id: "lista1-plan-comfort",
        badge: "Plan Comfort",
        title: "Galicia y/o Castilla y León",
        priceLabel: "279 €",
        subtitle:
          "Postulación sin límite de máster ni universidades en estas dos comunidades.",
        bullets: ["Más de 7 universidades públicas disponibles"],
      },
      {
        id: "lista1-plan-full",
        badge: "Plan Full Económico",
        title: "Todas las comunidades económicas",
        priceLabel: "359 €",
        subtitle:
          "Andalucía, Cantabria, Asturias, Castilla-La Mancha, Galicia y Castilla y León.",
        bullets: [
          "Más de 20 universidades públicas",
          "Ideal para maximizar opciones con bajo costo",
        ],
      },
    ],
  },
  {
    id: "lista2",
    title: "Universidades Intermedias · Lista 2",
    subtitle:
      "La Rioja, País Vasco, Murcia, Extremadura, Aragón y Comunidad Valenciana.",
    items: [
      {
        id: "lista2-plan-a",
        badge: "Plan A · 1 comunidad",
        title: "Una comunidad a elegir",
        priceLabel: "219 €",
        subtitle:
          "Postulación sin límite de máster en una sola comunidad de la lista 2.",
      },
      {
        id: "lista2-plan-basico-full",
        badge: "Plan Básico Full",
        title: "Tres comunidades",
        priceLabel: "249 €",
        subtitle:
          "Postulación sin límite de máster ni universidades en tres comunidades de la lista 2.",
      },
      {
        id: "lista2-plan-comfort",
        badge: "Plan Comfort",
        title: "Solo Comunidad Valenciana",
        priceLabel: "279 €",
        subtitle:
          "Postulación sin límite de máster en universidades de la Comunidad Valenciana.",
      },
      {
        id: "lista2-plan-full",
        badge: "Plan Full Económico",
        title: "Todas las comunidades intermedias",
        priceLabel: "349 €",
        subtitle:
          "Cobertura completa en La Rioja, País Vasco, Murcia, Extremadura, Aragón y C. Valenciana.",
      },
    ],
  },
  {
    id: "lista3",
    title: "Universidades Premium · Lista 3",
    subtitle: "Cataluña y Madrid (universidades públicas y privadas).",
    items: [
      {
        id: "lista3-plan-a",
        badge: "Plan A · 1 universidad",
        title: "Una universidad",
        priceLabel: "219 €",
        subtitle:
          "Postulación sin límite de máster dentro de una universidad (Madrid o Cataluña).",
      },
      {
        id: "lista3-plan-basico-full",
        badge: "Plan Básico Full",
        title: "5 universidades",
        priceLabel: "249 €",
        subtitle:
          "Postulación sin límite de máster en 5 universidades de Madrid y/o Cataluña.",
      },
      {
        id: "lista3-plan-comfort",
        badge: "Plan Comfort",
        title: "Todas las universidades de una comunidad",
        priceLabel: "310 €",
        subtitle:
          "Todas las universidades de Madrid o todas las de Cataluña.",
      },
      {
        id: "lista3-plan-full",
        badge: "Plan Full Económico",
        title: "Todas las universidades Madrid + Cataluña",
        priceLabel: "450 €",
        subtitle:
          "Postulación sin límite de máster en +16 universidades públicas.",
      },
    ],
  },
];

// “Planes avanzados” – Premium & Infinity
export const masterAdvancedPlans = [
  {
    id: "premium",
    badge: "Paquete Premium",
    title: "Hasta 6 comunidades autónomas",
    priceLabel: "700 €",
    subtitle:
      "Hasta +45 universidades, sin límite de listas. Ideal si necesitas una estrategia fuerte de admisión.",
    bullets: [
      "Combina comunidades económicas + premium",
      "Estrategia personalizada según visado/becas",
    ],
  },
  {
    id: "infinity",
    badge: "Paquete Infinity",
    title: "Cobertura total España",
    priceLabel: "1.100 €",
    subtitle:
      "17 comunidades españolas, hasta +80 universidades públicas y privadas. Máxima cobertura.",
    bullets: [
      "Pensado para quien no puede arriesgarse a quedarse sin plaza",
      "Orientado a urgencias de visado y becas exigentes",
    ],
  },
];
