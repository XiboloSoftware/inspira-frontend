// src/pages/panel/components/PanelSidebar.jsx
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";

export default function PanelSidebar({ user, activeTab, onChangeTab }) {
  const { logout } = useAuth();

const inicial = user?.nombre?.[0] || user?.email_contacto?.[0] || "U";
const nombre = user?.nombre || "Mi panel Inspira";
const correo = user?.email_contacto || "";

  return (
    <aside className="w-72 bg-gradient-to-b from-[#023A4B] to-[#046C8C] text-white flex flex-col">
      {/* Header usuario */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold">
            {inicial}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate">{nombre}</span>
            <span className="text-xs text-white/70 truncate">{correo}</span>
          </div>
        </div>
      </div>

      {/* Menú principal */}
      <div className="flex-1 px-4 py-4">
        <SidebarItem
          label="Mis citas"
          active={activeTab === "citas"}
          onClick={() => onChangeTab("citas")}
        />
        <SidebarItem
          label="Perfil"
          active={activeTab === "perfil"}
          onClick={() => onChangeTab("perfil")}
        />
        <SidebarItem
          label="Mis servicios"
          active={activeTab === "servicios"}
          onClick={() => onChangeTab("servicios")}
        />
      </div>

      {/* Acciones inferiores */}
      <div className="px-6 py-4 border-t border-white/10 space-y-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          Volver al inicio
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/80 hover:text-white transition"
        >
          Cerrar sesión
        </button>

        <p className="text-xs text-white/60 mt-1">
          Inspira | Panel de cliente
        </p>
      </div>
    </aside>
  );
}
