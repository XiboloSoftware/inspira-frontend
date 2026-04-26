//inspira-frontend\src\components\layout\Header\header.data.js
export const navItems = [
  { label: "Inicio", href: "/" },

  // paso 1 del negocio: diagnóstico
  { label: "Diagnóstico", href: "/diagnostico", highlight: true },

  // paquetes educativos
{
  label: "Programa Máster 360°",
  href: "/servicios/master",
},


  // calculadora pública gratuita
  {
    label: "Calculadora Máster Gratis",
    href: "/calculadora-master",
    badge: true,
  },

  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];
