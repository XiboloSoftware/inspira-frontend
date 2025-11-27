import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    // Si no viene token → volver al inicio
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // 1) Guardar token
    localStorage.setItem("token_cliente", token);
    setUserFromToken(token);

    // 2) Revisar si hay un destino guardado antes del login
    const redirect =
      localStorage.getItem("post_login_redirect") || "/diagnostico";

    // 3) Limpiar la clave para no reutilizarla
    localStorage.removeItem("post_login_redirect");

    // 4) Redirigir
    navigate(redirect, { replace: true });
  }, [navigate, searchParams, setUserFromToken]);

  return <p>Procesando autenticación...</p>;
}
