// src/pages/auth/AuthSuccess.jsx
// F:\PROGRAMACION\paginaweb_insipira\inspira-frontend\src\pages\auth\AuthSuccess.jsx

import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // si no viene token, igual redirigimos a donde tenga sentido
    if (!token) {
      const redirect = localStorage.getItem("post_login_redirect") || "/";
      localStorage.removeItem("post_login_redirect");
      window.location.replace(redirect);
      return;
    }

    // guardar token (clave que realmente uses en tu AuthContext; yo asumo token_cliente)
    localStorage.setItem("token_cliente", token);

    // limpiar el query ?token=...
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    // leer destino deseado (si alguien lo guardó antes de ir a /auth/google)
    const redirect = localStorage.getItem("post_login_redirect") || "/";

    // limpiar para no reutilizarlo
    localStorage.removeItem("post_login_redirect");

    // redirigir
    window.location.replace(redirect);
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
