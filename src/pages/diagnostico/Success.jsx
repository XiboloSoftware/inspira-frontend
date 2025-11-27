import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // limpia la URL (quita token)
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // IMPORTANTÍSIMO: replace evita que quede la app en un estado intermedio
      window.location.replace("/diagnostico");
      return;
    }

    // si no vino token, vuelve al login
    window.location.replace("/diagnostico");
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
