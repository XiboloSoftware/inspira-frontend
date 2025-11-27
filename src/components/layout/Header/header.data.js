export const navItems = [
  { label: "Inicio", href: "/" },

  // paso 1 del negocio: diagnóstico
  { label: "Diagnóstico", href: "/diagnostico", highlight: true },

  // paquetes educativos
  {
    label: "Servicios Educativos",
    href: "/servicios-educativos",
    children: [
      { label: "Paquete Máster", href: "/servicios/master" },
      { label: "Paquete Grado", href: "/servicios/grado" },
      { label: "Paquete FP", href: "/servicios/fp" },
      { label: "Homologación", href: "/servicios/homologacion" },
    ],
  },

  // paquetes migratorios
  {
    label: "Servicios Migratorios",
    href: "/servicios-migratorios",
    children: [
      { label: "Estancia por Estudios", href: "/servicios/estancia" },
      { label: "Visa de Estudios", href: "/servicios/visa-estudios" },
      { label: "Visa Acompañante", href: "/servicios/visa-acompanante" },
      { label: "Visa Trabajo", href: "/servicios/visa-trabajo" },
      { label: "Visa No Lucrativa", href: "/servicios/visa-no-lucrativa" },
    ],
  },

  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];
