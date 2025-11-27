// src/pages/panel/PanelCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

import PanelSidebar from "./components/PanelSidebar";
import PerfilCliente from "./components/PerfilCliente";
import MisCitas from "./components/MisCitas";
import MisServicios from "./components/MisServicios";

export default function PanelCliente() {
  const [tab, setTab] = useState("citas"); // "perfil" | "citas" | "servicios"
  const [user, setUser] = useState(null);

  useEffect(() => {
    cargarMe();
  }, []);

  async function cargarMe() {
    try {
      const r = await apiGET("/auth/me");
      if (r.ok) {
        setUser(r.user || r.cliente || r);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* SIDEBAR IZQUIERDO */}
      <PanelSidebar user={user} activeTab={tab} onChangeTab={setTab} />

      {/* CONTENIDO DERECHA */}
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
