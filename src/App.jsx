// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\App.jsx

import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import Home from "./pages/home/Home";
import Diagnostico from "./pages/diagnostico/Diagnostico";
import AuthSuccess from "./pages/auth/AuthSuccess";
import MpSuccess from "./pages/diagnostico/Success";
import Failure from "./pages/diagnostico/Failure";
import Pending from "./pages/diagnostico/Pending";
import MasterLanding from "./pages/servicios/master/MasterLanding";
import EstanciaLanding from "./pages/servicios/estancia/EstanciaLanding";
import BackofficeApp from "./pages/backoffice/BackofficeApp";

import PanelCliente from "./pages/panel/PanelCliente";   //  👈 AÑADIDO

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

      {path === "/diagnostico" && <Diagnostico />}
      {path === "/diagnostico/success" && <MpSuccess />}
      {path === "/diagnostico/failure" && <Failure />}
      {path === "/diagnostico/pending" && <Pending />}

      {path === "/auth/success" && <AuthSuccess />}

      {path === "/servicios/master" && <MasterLanding />}
      {path === "/servicios/estancia" && <EstanciaLanding />}

      {/* Panel cliente con layout propio */}
      {path === "/panel" && <PanelCliente />}

      {/* fallback */}
      {![
        "/",
        "/diagnostico",
        "/diagnostico/success",
        "/diagnostico/failure",
        "/diagnostico/pending",
        "/auth/success",
        "/servicios/master",
        "/servicios/estancia",
        "/panel",
      ].includes(path) && <Home />}
    </div>
  );
}
