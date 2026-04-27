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
      {/* Backdrop oscuro — solo en móvil cuando está abierto */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 30,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 250ms",
        }}
        className="md:hidden"
      />

      {/* Sidebar propiamente dicho */}
      <aside
        style={{ zIndex: 40 }}
        className={[
          // Posición: fixed en móvil, static en desktop
          "fixed md:static",
          "inset-y-0 left-0",
          // Tamaño
          "w-64 h-full",
          // Colores
          "bg-primary text-white",
          // Flex para header + nav
          "flex flex-col",
          // Animación slide — en desktop siempre visible
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          // En desktop nunca shrink
          "md:flex-shrink-0",
        ].join(" ")}
      >
        {/* Cabecera del sidebar */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
          <button
            onClick={() => handleNav("/backoffice/dashboard")}
            className="text-xl font-bold text-left leading-tight hover:text-white/90 transition"
          >
            Inspira Backoffice
          </button>

          {/* Botón cerrar — solo en móvil */}
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {items.map((it) => {
            const active = path.startsWith(it.href);
            return (
              <button
                key={it.href}
                onClick={() => handleNav(it.href)}
                className={[
                  "w-full text-left px-3 py-2.5 rounded-lg transition text-sm",
                  active
                    ? "bg-white/15 font-semibold text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                ].join(" ")}
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
