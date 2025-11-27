import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";

export default function UserMenu({ user }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const nombre = user?.nombre || user?.name || "Usuario";
  const correo = user?.email || user?.correo || "";
  const foto = user?.foto || user?.picture || null;

  // cerrar al hacer click afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-secondary-light transition"
      >
        {foto ? (
          <img src={foto} alt={nombre} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
            {(nombre?.[0] || "U").toUpperCase()}
          </div>
        )}

        <div className="text-left leading-tight">
          <div className="text-sm font-semibold text-primary">{nombre}</div>
          {correo && <div className="text-xs text-neutral-500">{correo}</div>}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
          <a
            href="/panel"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-neutral-900 hover:bg-secondary-light"
          >
            Mi panel
          </a>

          <button
  type="button"
  onClick={() => {
    setOpen(false);
    logout();
  }}
  className="w-full text-left px-4 py-2 text-sm text-neutral-900 hover:bg-secondary-light"
>
  Cerrar sesión
</button>
        </div>
      )}
    </div>
  );
}
