import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (token) {
      // 1) Guardar token
      localStorage.setItem("token", token);

      // 2) Actualizar usuario en el contexto
      (async () => {
        try {
          await refreshUser();
        } catch (e) {
          console.error("Error refrescando usuario:", e);
        } finally {
          // 3) Volver al flujo de diagnóstico (o donde quieras)
          navigate("/diagnostico", { replace: true });
        }
      })();
    } else {
      // Sin token → volver igual al diagnóstico
      navigate("/diagnostico", { replace: true });
    }
  }, [search, navigate, refreshUser]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p>Procesando inicio de sesión...</p>
    </div>
  );
}
