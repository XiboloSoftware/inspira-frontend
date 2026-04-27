// src/pages/panel/PanelCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

import PanelSidebar from "./components/PanelSidebar";
import PerfilCliente from "./components/PerfilCliente";
import MisCitas from "./components/citas/MisCitas";
import MisServicios from "./components/MisServicios";

export default function PanelCliente() {
  const [tab, setTab] = useState(() => {
    if (typeof window === "undefined") return "citas";
    const saved = window.localStorage.getItem("panel_tab");
    if (saved === "perfil" || saved === "citas" || saved === "servicios") return saved;
    return "citas";
  });

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("panel_tab", tab);
    } catch (e) {
      console.error("No se pudo guardar panel_tab", e);
    }
  }, [tab]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    cargarMe();
  }, []);

  async function cargarMe() {
    try {
      const r = await apiGET("/cliente/me");
      if (!r.ok) {
        window.location.href = "/";
        return;
      }
      setUser(r.cliente || r.user || r);
    } catch (e) {
      console.error(e);
      window.location.href = "/";
    }
  }

  function handleChangeTab(newTab) {
    setTab(newTab);
    setSidebarOpen(false);
  }

  return (
    <div className="h-screen overflow-hidden flex bg-neutral-50 relative">
      {/* Overlay oscuro para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <PanelSidebar
        user={user}
        activeTab={tab}
        onChangeTab={handleChangeTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
        {/* Topbar sticky */}
        <div className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-sm border-b border-neutral-200 px-5 sm:px-8 py-4 flex items-center gap-4 shrink-0">
          <button
            className="md:hidden flex flex-col justify-center gap-[6px] w-10 h-10 p-2 rounded-lg bg-white border border-neutral-200 shadow-sm shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
            <span className="block w-full h-[2px] bg-neutral-600 rounded" />
          </button>
          <div>
            <p className="text-xs font-bold text-[#046C8C] uppercase tracking-widest leading-none mb-0.5">
              Panel de cliente
            </p>
            <h1 className="text-xl font-bold text-neutral-900 leading-tight">Mi panel</h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-5 overflow-auto">
          <div className={tab === "servicios" ? "w-full max-w-7xl mx-auto" : "max-w-4xl"}>
            {tab === "perfil" && (
              <PerfilCliente user={user} onUserUpdated={(nuevo) => setUser(nuevo)} />
            )}
            {tab === "citas" && <MisCitas />}
            {tab === "servicios" && <MisServicios />}
          </div>
        </div>
      </main>
    </div>
  );
}
