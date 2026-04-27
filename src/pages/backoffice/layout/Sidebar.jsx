import { navigate } from "../../../services/navigate";

const items = [
  { label: "Dashboard", href: "/backoffice/dashboard" },
  { label: "Agenda", href: "/backoffice/agenda" },
  { label: "Reservas Diagnóstico", href: "/backoffice/diagnosticos" },
  { label: "Solicitudes", href: "/backoffice/solicitudes" },
  { label: "Documentos", href: "/backoffice/documentos" },
  { label: "Calculadora — Leads", href: "/backoffice/calculadora" },
  { label: "Clientes", href: "/backoffice/clientes" },
  { label: "Precios/Servicios", href: "/backoffice/precios" },
  { label: "Checklist Servicios", href: "/backoffice/checklist-servicios" },
  { label: "Instructivos", href: "/backoffice/instructivos" },
  { label: "Panel Asesoras", href: "/backoffice/panel-asesoras" },
  { label: "Settings", href: "/backoffice/settings" },
];

export default function Sidebar({ path, open, onClose }) {
  function handleNav(href) {
    navigate(href);
    onClose?.();
  }

  return (
    <>
      {/* Overlay oscuro en móvil cuando el drawer está abierto */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar: drawer en móvil, fijo en desktop */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-30
          w-64 bg-primary text-white h-full md:h-full
          px-4 py-6 flex-shrink-0 overflow-y-auto
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div
          className="text-2xl font-bold mb-8 cursor-pointer"
          onClick={() => handleNav("/backoffice/dashboard")}
        >
          Inspira Backoffice
        </div>

        <nav className="space-y-1">
          {items.map((it) => {
            const active = path.startsWith(it.href);
            return (
              <button
                key={it.href}
                onClick={() => handleNav(it.href)}
                className={`w-full text-left px-3 py-2 rounded-lg transition
                  ${active ? "bg-primary-light" : "hover:bg-primary-light/70"}
                `}
              >
                {it.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
