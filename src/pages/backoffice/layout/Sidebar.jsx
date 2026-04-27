import { navigate } from "../../../services/navigate";

const items = [
  { label: "Dashboard",           href: "/backoffice/dashboard" },
  { label: "Agenda",              href: "/backoffice/agenda" },
  { label: "Reservas Diagnóstico",href: "/backoffice/diagnosticos" },
  { label: "Solicitudes",         href: "/backoffice/solicitudes" },
  { label: "Documentos",          href: "/backoffice/documentos" },
  { label: "Calculadora — Leads", href: "/backoffice/calculadora" },
  { label: "Clientes",            href: "/backoffice/clientes" },
  { label: "Precios/Servicios",   href: "/backoffice/precios" },
  { label: "Checklist Servicios", href: "/backoffice/checklist-servicios" },
  { label: "Instructivos",        href: "/backoffice/instructivos" },
  { label: "Panel Asesoras",      href: "/backoffice/panel-asesoras" },
  { label: "Settings",            href: "/backoffice/settings" },
];

export default function Sidebar({ path, open, onClose, pinned, onTogglePin }) {
  function handleNav(href) {
    navigate(href);
    if (!pinned) onClose?.();
  }

  const header = (
    <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
      <button
        onClick={() => handleNav("/backoffice/dashboard")}
        className="text-base font-bold text-left leading-tight hover:text-white/90 transition truncate"
      >
        Inspira Backoffice
      </button>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        {/* Pin/Unpin — solo en desktop lg+ */}
        <button
          onClick={onTogglePin}
          title={pinned ? "Desanclar sidebar" : "Anclar sidebar"}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          {pinned ? (
            // Anclar activo → icono para desanclar (collapse left)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          ) : (
            // Desanclado → icono para anclar (pin)
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l14 14M9 3l6 6-2 2 4 4-1.5 1.5-4-4-2 2-6-6L9 3zM3 21l5-5" />
            </svg>
          )}
        </button>

        {/* Cerrar — solo en overlay (no pinned) */}
        {!pinned && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex lg:hidden items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  const nav = (
    <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
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
                : "text-white/75 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </nav>
  );

  if (pinned) {
    // Modo fijo: visible en desktop lg+, oculto en móvil/tablet
    return (
      <aside className="hidden lg:flex flex-col w-52 xl:w-60 shrink-0 bg-primary text-white h-full">
        {header}
        {nav}
      </aside>
    );
  }

  // Modo overlay: hamburguesa en todos los tamaños
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-250 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-primary text-white transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {header}
        {nav}
      </aside>
    </>
  );
}
