export default function Topbar({ user, onLogout, onMenuToggle, sidebarPinned }) {
  return (
    <header
      style={{ zIndex: 50 }}
      className="relative w-full bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center shrink-0"
    >
      <div className="flex items-center gap-3">
        {/* Siempre visible — alterna entre abrir drawer (overlay) o desanclar (pinned) */}
        <button
          onClick={onMenuToggle}
          aria-label={sidebarPinned ? "Ocultar menú" : "Abrir menú"}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-primary hover:bg-neutral-100 transition"
        >
          {sidebarPinned ? (
            /* Sidebar fijo visible → mostrar X para cerrarlo */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Sidebar oculto → mostrar hamburguesa para abrirlo */
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <span className="text-primary font-semibold text-sm">Panel interno</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500 hidden sm:block">
          {user?.email} · <b>{user?.rol}</b>
        </span>
        <span className="text-xs text-neutral-500 sm:hidden font-medium">{user?.rol}</span>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition text-sm font-medium"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
