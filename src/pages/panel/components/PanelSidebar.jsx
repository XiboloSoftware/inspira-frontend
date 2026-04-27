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
        // Móvil: overlay fijo, slide in/out
        "fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: en flujo normal, siempre visible
        "md:relative md:z-auto md:translate-x-0 md:w-auto md:min-w-[210px] md:max-w-[250px] md:h-screen",
      ].join(" ")}
    >
      {/* Botón cerrar en móvil */}
      <div className="md:hidden flex justify-end px-3 pt-3 shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white text-sm leading-none"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Header usuario */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0 uppercase">
            {inicial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate leading-tight">{nombre}</span>
            <span className="text-[11px] text-white/60 truncate leading-tight">{correo}</span>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="flex-1 px-2 py-3 overflow-y-auto min-h-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 px-3 mb-1.5">
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
      <div className="px-3 py-3 border-t border-white/10 space-y-1 shrink-0">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          ← Volver al inicio
        </button>
        <button
          type="button"
          onClick={logout}
          className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/70 transition"
        >
          Cerrar sesión
        </button>
        <p className="text-[10px] text-white/30 px-1 pt-1">Inspira | Panel de cliente</p>
      </div>
    </aside>
  );
}
