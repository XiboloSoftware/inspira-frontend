export default function Topbar({ user, onLogout }) {
  return (
    <header className="w-full bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
      <div className="text-primary font-semibold">Panel interno</div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-neutral-700">
          {user?.email} · <b>{user?.rol}</b>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
