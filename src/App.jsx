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

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Backoffice
  if (path.startsWith("/backoffice")) {
    return <BackofficeApp />;
  }

  const isPanel = path.startsWith("/panel");

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header solo en la web pública */}
      {!isPanel && <Header />}

      {path === "/" && <Home />}

      {path === "/auth/success" && <AuthSuccess />}

      {path === "/servicios/master" && <PortalServiciosMaster />}
      {path === "/servicios/estancia" && <EstanciaLanding />}
      {path === "/calculadora-master" && <CalculadoraMaster />}

      {/* Panel cliente con layout propio */}
      {path === "/panel" && <PanelCliente />}

      {/* fallback */}
      {![
        "/",
        "/auth/success",
        "/servicios/master",
        "/servicios/estancia",
        "/calculadora-master",
        "/panel",
      ].includes(path) && <Home />}
    </div>
  );
}
