// src/pages/panel/PanelCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

import PanelSidebar from "./components/PanelSidebar";
import PerfilCliente from "./components/PerfilCliente";
import MisCitas from "./components/citas/MisCitas";
import MisServicios from "./components/MisServicios";

export default function PanelCliente() {
  // 1) Leer la pestaña guardada (si existe)
  const [tab, setTab] = useState(() => {
    if (typeof window === "undefined") return "citas";

    const saved = window.localStorage.getItem("panel_tab");
    // solo aceptamos valores válidos
    if (saved === "perfil" || saved === "citas" || saved === "servicios") {
      return saved;
    }
    return "citas";
  });

  const [user, setUser] = useState(null);

  // 2) CADA VEZ que cambie `tab`, guardar en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem("panel_tab", tab);
    } catch (e) {
      console.error("No se pudo guardar panel_tab", e);
    }
  }, [tab]); // 👈 se ejecuta cuando `tab` cambia

  // 3) Mantienes tu useEffect de auth tal cual
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

      <main className="flex-1 px-8 py-8">
        <header className="mb-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Panel de cliente
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">Mi panel</h1>
        </header>

        <div className="max-w-4xl">
          {tab === "perfil" && <PerfilCliente user={user} />}
          {tab === "citas" && <MisCitas />}
          {tab === "servicios" && <MisServicios />}
        </div>
      </main>
    </div>
  );
}
