// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\App.jsx

import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import Home from "./pages/home/Home";
import AuthSuccess from "./pages/auth/AuthSuccess";
import MasterLanding from "./pages/servicios/master/MasterLanding";
import PortalServiciosMaster from "./pages/servicios/master/PortalServiciosMaster";
import EstanciaLanding from "./pages/servicios/estancia/EstanciaLanding";
import BackofficeApp from "./pages/backoffice/BackofficeApp";
import CalculadoraMaster from "./pages/calculadora/CalculadoraMaster";
import PanelCliente from "./pages/panel/PanelCliente";
import NotFound from "./pages/NotFound";

import { useSEO } from "./hooks/useSEO";
import SEOSchema from "./components/SEOSchema";

// ── Configuración SEO por ruta ─────────────────────────────────────────────
const SEO_PAGES = {
  "/": {
    title: "Tu camino a estudiar en España",
    description:
      "Inspira Legal te acompaña desde la elección del máster hasta la matrícula en universidades españolas de primer nivel. Visas, apostilla y extranjería.",
    path: "/",
  },
  "/servicios/master": {
    title: "Programa Máster 360° – Estudia en España",
    description:
      "Servicio integral para estudiar un máster en España: selección de universidad, visado de estudiante, apostilla y trámites de extranjería.",
    path: "/servicios/master",
  },
  "/servicios/estancia": {
    title: "Visa de Estancia en España desde Perú",
    description:
      "Gestiona tu visa de estancia y permisos de residencia en España con Inspira Legal. Asesoría personalizada, sin sorpresas.",
    path: "/servicios/estancia",
  },
  "/calculadora-master": {
    title: "Calculadora de Másteres en España – Gratis",
    description:
      "Calcula el presupuesto total para estudiar un máster en España: matrícula, alojamiento, visado y gastos de vida. Completamente gratis.",
    path: "/calculadora-master",
  },
};

// ── Schemas JSON-LD ─────────────────────────────────────────────────────────
const SCHEMA_ORG = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: "Inspira Legal",
  url: "https://inspira-legal.cloud",
  description:
    "Consultoría especializada en másteres y postgrados en España, visas de estudiante y trámites de extranjería para peruanos.",
  areaServed: ["PE", "ES"],
  serviceType: ["Asesoría académica", "Gestión de visas", "Trámites de extranjería"],
  address: {
    "@type": "PostalAddress",
    addressCountry: "PE",
    addressLocality: "Lima",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

const SCHEMA_MASTER = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Programa Máster 360° en España",
  provider: { "@type": "Organization", name: "Inspira Legal" },
  serviceType: "Asesoría académica para másteres en España",
  areaServed: "PE",
  description:
    "Acompañamiento integral para estudiar un máster en España: selección de universidad, visado de estudiante, trámites de extranjería y más.",
};

const SCHEMA_ESTANCIA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Gestión de Visa de Estancia en España",
  provider: { "@type": "Organization", name: "Inspira Legal" },
  serviceType: "Gestión de visas y extranjería",
  areaServed: "PE",
  description:
    "Gestión de visa de estancia y permisos de residencia en España para peruanos.",
};

// ── Componente de SEO por ruta ──────────────────────────────────────────────
const PRIVATE_PATHS = ["/panel", "/auth/success"];

function RouteSEO({ path }) {
  const isPrivate =
    PRIVATE_PATHS.includes(path) || path.startsWith("/backoffice");
  const config = SEO_PAGES[path];
  useSEO(isPrivate ? { noIndex: true } : (config || { noIndex: true }));
  return null;
}

// ── App ─────────────────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/auth/success",
  "/servicios/master",
  "/servicios/estancia",
  "/calculadora-master",
  "/panel",
];

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path.startsWith("/backoffice")) {
    return <BackofficeApp />;
  }

  const isPanel = path.startsWith("/panel");
  const isNotFound = !PUBLIC_PATHS.includes(path);

  return (
    <div className="min-h-screen w-full bg-white">
      <RouteSEO path={path} />

      {/* Schema.org según ruta */}
      {path === "/" && <SEOSchema schema={SCHEMA_ORG} id="org" />}
      {path === "/servicios/master" && <SEOSchema schema={SCHEMA_MASTER} id="master" />}
      {path === "/servicios/estancia" && <SEOSchema schema={SCHEMA_ESTANCIA} id="estancia" />}

      {!isPanel && !isNotFound && <Header />}

      {path === "/" && <Home />}
      {path === "/auth/success" && <AuthSuccess />}
      {path === "/servicios/master" && <PortalServiciosMaster />}
      {path === "/servicios/estancia" && <EstanciaLanding />}
      {path === "/calculadora-master" && <CalculadoraMaster />}
      {path === "/panel" && <PanelCliente />}

      {/* 404 */}
      {isNotFound && (
        <>
          <Header />
          <NotFound />
        </>
      )}
    </div>
  );
}
