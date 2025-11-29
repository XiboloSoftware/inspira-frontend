//inspira-frontend\src\pages\backoffice\BackofficeApp.jsx
import { useEffect, useState } from "react";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import ProtectedRoute from "./layout/ProtectedRoute";
import BackofficeLogin from "./login/BackofficeLogin";
import Dashboard from "./dashboard/Dashboard";
import Diagnosticos from "./diagnosticos/Diagnosticos";
import PreciosServicios from "./precios/PreciosServicios";
import UsuariosSettings from "./settings/UsuariosSettings";
import Clientes from "./clientes/Clientes";
import ChecklistServicios from "./checklist/ChecklistServicios";
import SolicitudesList from "./solicitudes/SolicitudesList";


export default function BackofficeApp() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("bo_user");
    return u ? JSON.parse(u) : null;
  });

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function logout() {
    localStorage.removeItem("bo_token");
    localStorage.removeItem("bo_user");
    setUser(null);
    // manda a login
    window.history.pushState({}, "", "/backoffice/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Si no hay token => login
  const token = localStorage.getItem("bo_token");
  if (!token || path === "/backoffice/login") {
    return <BackofficeLogin onLogin={setUser} />;
  }

  return (
    <ProtectedRoute onLogout={logout}>
      <div className="flex w-full">
        <Sidebar path={path} />

        <div className="flex-1 bg-white min-h-screen">
          <Topbar user={user} onLogout={logout} />

          {/* Rutas internas */}
          {path === "/backoffice" && <Dashboard />}
          {path === "/backoffice/dashboard" && <Dashboard />}

          {/* placeholders para módulos que haremos luego */}
          {path === "/backoffice/agenda" && <Placeholder title="Agenda" />}
          {path === "/backoffice/solicitudes" && <Placeholder title="Solicitudes" />}
          {path === "/backoffice/checklist-servicios" && <ChecklistServicios />}


          {path === "/backoffice/clientes" && <Clientes user={user} />}
          {path === "/backoffice/precios" && <PreciosServicios />}
          {path === "/backoffice/solicitudes" && <SolicitudesList />}



          {path === "/backoffice/diagnosticos" && <Diagnosticos user={user} />}
          {path === "/backoffice/settings" && <UsuariosSettings user={user} />}

        </div>
      </div>
    </ProtectedRoute>
  );
}

function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p className="text-neutral-700 mt-2">Módulo en construcción.</p>
    </div>
  );
}
