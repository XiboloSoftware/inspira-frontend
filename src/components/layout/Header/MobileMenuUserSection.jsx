// src/components/layout/Header/MobileMenuUserSection.jsx

function getUserInfo(user) {
  const nombre = user?.nombre || user?.name || user?.nombres || "Usuario";
  const correo = user?.email || user?.correo || "";
  const foto = user?.foto || user?.picture || user?.avatarUrl || null;
  return { nombre, correo, foto };
}

export default function MobileMenuUserSection({ user, onLogin, onLogout }) {
  const { nombre, correo, foto } = getUserInfo(user);

  return (
    <div className="mt-auto flex flex-col gap-4">
      {!user && (
        <button
          type="button"
          onClick={onLogin}
          className="w-full text-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light transition"
        >
          Iniciar con Google
        </button>
      )}

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
            onClick={onLogout}
            className="w-full text-left rounded-lg px-4 py-2 text-sm text-neutral-900 hover:bg-secondary-light transition"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
