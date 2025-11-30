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
import SolicitudDetalleAdmin from "./solicitudes/SolicitudDetalleAdmin"; // ← NUEVO

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
    window.history.pushState({}, "", "/backoffice/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const token = localStorage.getItem("bo_token");
  if (!token || path === "/backoffice/login") {
    return <BackofficeLogin onLogin={setUser} />;
  }

  const isSolicitudDetalle = path.startsWith("/backoffice/solicitudes/");
  const idSolicitudDetalle = isSolicitudDetalle
    ? Number(path.split("/").pop())
    : null;

  return (
    <ProtectedRoute onLogout={logout}>
      <div className="flex w-full">
        <Sidebar path={path} />

        <div className="flex-1 min-h-screen bg-neutral-50">
          <Topbar user={user} />

          <div className="p-4">
            {path === "/backoffice/dashboard" && <Dashboard user={user} />}

            {/* placeholders para módulos que haremos luego */}
            {path === "/backoffice/agenda" && (
              <Placeholder title="Agenda" />
            )}

            {path === "/backoffice/checklist-servicios" && (
              <ChecklistServicios />
            )}

            {path === "/backoffice/clientes" && <Clientes user={user} />}
            {path === "/backoffice/precios" && <PreciosServicios />}

            {path === "/backoffice/solicitudes" && <SolicitudesList />}

            {isSolicitudDetalle && idSolicitudDetalle && (
              <SolicitudDetalleAdmin idSolicitud={idSolicitudDetalle} />
            )}

            {path === "/backoffice/diagnosticos" && (
              <Diagnosticos user={user} />
            )}
            {path === "/backoffice/settings" && (
              <UsuariosSettings user={user} />
            )}
          </div>
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
