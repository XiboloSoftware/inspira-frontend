import { navItems } from "./header.data";
import NavItem from "./NavItem";
import { useAuth } from "../../../context/AuthContext";

// arriba del archivo
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();

  if (!open) return null;

  const nombre = user?.nombre || user?.name || user?.nombres || "Usuario";
  const correo = user?.email || user?.correo || "";
  const foto = user?.foto || user?.picture || user?.avatarUrl || null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  // NUEVO: login guardando la ruta actual
  const handleLogin = () => {
    const current =
      window.location.pathname +
      window.location.search +
      window.location.hash;

    localStorage.setItem("post_login_redirect", current || "/");
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-lg">Menú</span>
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </div>

        {/* CTA Diagnóstico */}
        <a
          href="/diagnostico"
          className="w-full text-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-dark transition"
        >
          Reserva Diagnóstico 25€
        </a>

        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} onClick={onClose} />
          ))}
        </ul>

        {/* --- Usuario o Login --- */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Si NO hay user → botón Google */}
          {!user && (
            <button
              type="button"
              onClick={handleLogin}
              className="w-full text-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
            >
              Iniciar con Google
            </button>
          )}

          {/* Si hay user → avatar, info y logout */}
          {user && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {foto ? (
                  <img
                    src={foto}
                    alt={nombre}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                    {(nombre?.[0] || "U").toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-primary">
                    {nombre}
                  </div>
                  {correo && (
                    <div className="text-xs text-neutral-500">{correo}</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left rounded-lg px-4 py-2 text-sm text-neutral-900 hover:bg-secondary-light transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
