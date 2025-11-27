import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("AUTH SUCCESS token:", token);

    // si NO viene token
    if (!token) {
      const redirect = localStorage.getItem("post_login_redirect") || "/";
      localStorage.removeItem("post_login_redirect");
      window.location.replace(redirect);
      return;
    }

    // 1) Guardar el token EXACTAMENTE como antes
    localStorage.setItem("token", token);

    // 2) Limpiar la URL (quitar ?token=...)
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    // 3) Leer el destino deseado, si existe
    const redirect =
      localStorage.getItem("post_login_redirect") || "/";

    // 4) Limpiar la clave para no reutilizarla
    localStorage.removeItem("post_login_redirect");

    // 5) Redirigir a donde corresponde
    window.location.replace(redirect);
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
