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

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <PanelSidebar user={user} activeTab={tab} onChangeTab={setTab} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Panel de cliente
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">Mi panel</h1>
        </header>

        {/* ✅ Ancho dinámico: servicios ocupa más */}
        <div className={tab === "servicios" ? "w-full max-w-7xl mx-auto" : "max-w-4xl"}>
          {tab === "perfil" && (
            <PerfilCliente user={user} onUserUpdated={(nuevo) => setUser(nuevo)} />
          )}
          {tab === "citas" && <MisCitas />}
          {tab === "servicios" && <MisServicios />}
        </div>
      </main>
    </div>
  );
}
