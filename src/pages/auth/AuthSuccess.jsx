import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromToken } = useAuth(); // o la función que ya uses

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // 1) Guardar token como ya lo haces (ejemplo)
    localStorage.setItem("token_cliente", token);
    setUserFromToken(token);

    // 2) Leer destino deseado (si existe)
    const redirect =
      localStorage.getItem("post_login_redirect") || "/diagnostico";

    // 3) Limpiar la llave para no reutilizarla luego
    localStorage.removeItem("post_login_redirect");

    // 4) Redirigir
    navigate(redirect, { replace: true });
  }, [navigate, searchParams, setUserFromToken]);

  return <p>Procesando autenticación...</p>;
}
