// src/pages/auth/AuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    localStorage.setItem("token_cliente", token);
    setUserFromToken(token);

    const redirect =
      localStorage.getItem("post_login_redirect") || "/diagnostico";

    localStorage.removeItem("post_login_redirect");

    navigate(redirect, { replace: true });
  }, [navigate, searchParams, setUserFromToken]);

  return <p>Procesando autenticación...</p>;
}
