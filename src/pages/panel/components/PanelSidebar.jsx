// src/pages/panel/components/PanelSidebar.jsx
import SidebarItem from "./SidebarItem";
import { useAuth } from "../../../context/AuthContext";
import { navigate } from "../../../services/navigate";

export default function PanelSidebar({ user, activeTab, onChangeTab, isOpen, onClose }) {
  const { logout } = useAuth();

  const inicial = user?.nombre?.[0] || user?.email_contacto?.[0] || "U";
  const nombre = user?.nombre || "Mi panel Inspira";
  const correo = user?.email_contacto || "";

  return (
    <aside
      className={[
        "bg-gradient-to-b from-[#023A4B] to-[#046C8C] text-white flex flex-col overflow-hidden flex-none",
        "fixed inset-y-0 left-0 z-30 w-72 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:z-auto md:translate-x-0 md:w-64 md:h-screen",
      ].join(" ")}
    >
      {/* Botón cerrar en móvil */}
      <div className="md:hidden flex justify-end px-4 pt-4 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-base leading-none"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Header usuario */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-base font-bold shrink-0 uppercase">
            {inicial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold truncate leading-tight">{nombre}</span>
            <span className="text-sm text-white/60 truncate leading-tight mt-0.5">{correo}</span>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 px-3 mb-2">
          Navegación
        </p>
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
      <div className="px-4 py-4 border-t border-white/10 space-y-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-left text-sm px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/15 transition font-medium"
        >
          ← Volver al inicio
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full text-left text-sm px-4 py-2.5 rounded-lg bg-white/5 hover:bg-red-500/70 transition font-medium"
        >
          Cerrar sesión
        </button>
        <p className="text-xs text-white/30 px-1 pt-1">Inspira | Panel de cliente</p>
      </div>
    </aside>
  );
}
