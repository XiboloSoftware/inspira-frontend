import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("AUTH SUCCESS token:", token);

    // Si no hay token -> ir al destino guardado o home
    if (!token) {
      const fallback = localStorage.getItem("post_login_redirect") || "/";
      localStorage.removeItem("post_login_redirect");
      window.location.replace(fallback);
      return;
    }

    // Guardar token (igual que antes lo tenías)
    localStorage.setItem("token", token);

    // Limpiar la URL (?token=...)
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    // Leer la ruta donde el usuario quería ir
    const redirect =
      localStorage.getItem("post_login_redirect") || "/";

    // Limpiar clave
    localStorage.removeItem("post_login_redirect");

    // Redirigir
    window.location.replace(redirect);
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
