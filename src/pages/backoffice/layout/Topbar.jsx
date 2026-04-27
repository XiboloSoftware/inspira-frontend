export default function Topbar({ user, onLogout, onMenuToggle }) {
  return (
    <header className="w-full bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa solo en móvil */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg text-primary hover:bg-neutral-200 transition"
          aria-label="Abrir menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-primary font-semibold">Panel interno</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-neutral-700 hidden sm:block">
          {user?.email} · <b>{user?.rol}</b>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition text-sm"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
