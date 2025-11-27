import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("AUTH SUCCESS token:", token);

    if (token) {
      localStorage.setItem("token", token);

      // limpia URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // ✅ replace para no quedar en estado intermedio
      window.location.replace("/diagnostico");
      return;
    }

    // si no vino token, igual vuelve a diagnostico
    window.location.replace("/diagnostico");
  }, []);

  return <div className="p-6">Iniciando sesión...</div>;
}
