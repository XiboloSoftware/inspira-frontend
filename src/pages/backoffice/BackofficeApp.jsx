// src/pages/backoffice/BackofficeApp.jsx
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
import SolicitudDetalleBackoffice from "./solicitudes/SolicitudDetalleBackoffice";
import InstructivosServicios from "./instructivos/InstructivosServicios";


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

  function navigate(to) {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function logout() {
    localStorage.removeItem("bo_token");
    localStorage.removeItem("bo_user");
    setUser(null);
    navigate("/backoffice/login");
  }

  const token = localStorage.getItem("bo_token");
  if (!token || path === "/backoffice/login") {
    return <BackofficeLogin onLogin={setUser} />;
  }

  // ¿Estamos en /backoffice/solicitudes/:id ?
  const isDetalleSolicitud = path.startsWith("/backoffice/solicitudes/");
  let idSolicitudDetalle = null;
  if (isDetalleSolicitud) {
    const parts = path.split("/");
    idSolicitudDetalle = parseInt(parts[parts.length - 1], 10);
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

          {path === "/backoffice/agenda" && <Placeholder title="Agenda" />}

          {/* LISTA DE SOLICITUDES */}
          {path === "/backoffice/solicitudes" && (
            <SolicitudesList
              onVerSolicitud={(id) =>
                navigate(`/backoffice/solicitudes/${id}`)
              }
            />
          )}

          {/* DETALLE DE SOLICITUD */}
          {isDetalleSolicitud && idSolicitudDetalle && (
            <SolicitudDetalleBackoffice
              idSolicitud={idSolicitudDetalle}
              onVolver={() => navigate("/backoffice/solicitudes")}
            />
          )}

          {path === "/backoffice/checklist-servicios" && <ChecklistServicios />}

          // NUEVO
          {path === "/backoffice/instructivos" && <InstructivosServicios />}


          {path === "/backoffice/clientes" && <Clientes user={user} />}
          {path === "/backoffice/precios" && <PreciosServicios />}

          {path === "/backoffice/diagnosticos" && (
            <Diagnosticos user={user} />
          )}
          {path === "/backoffice/settings" && (
            <UsuariosSettings user={user} />
          )}
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
