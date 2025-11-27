import { useState } from "react";
import { apiPOST } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

// Cambia esto por el id_servicio REAL de tu servicio 002 en la BD
const SERVICIO_MASTER_ID = "002";

// URL del backend para login con Google
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function Hero() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function manejarPago() {
  if (loading) return;

  // 1) Si NO está logueado, configuramos el destino post-login
  if (!user) {
    // Puedes usar la ruta que quieras como “premenu” del máster
    // por ejemplo: "/master" o "/#master"
    localStorage.setItem("post_login_redirect", "/"); // o "/master"

    window.location.href = `${API_URL}/auth/google`;
    return;
  }

  // 2) Si ya está logueado, flujo normal de pago
  setLoading(true);

  try {
    const r = await apiPOST("/mercadopago/servicio/preferencia", {
      id_servicio: SERVICIO_MASTER_ID,
    });

    if (r?.ok && r.preferencia?.init_point) {
      window.location.href = r.preferencia.init_point;
      return;
    }

    const msg =
      r?.msg ||
      r?.message ||
      "No se pudo iniciar el pago. Inténtalo de nuevo.";
    alert(msg);
  } catch (e) {
    console.error(e);
    alert("Ocurrió un error al iniciar el pago.");
  } finally {
    setLoading(false);
  }
}

  return (
    <section className="w-full bg-secondary-light py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Tu camino a estudiar o vivir en España empieza aquí.
          </h1>

          <p className="text-neutral-700 text-lg mb-6">
            Programa Máster 360°: te acompañamos desde la elección del máster
            hasta la matrícula en universidades españolas de primer nivel.
          </p>

          <button
            type="button"
            onClick={manejarPago}
            disabled={loading}
            className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-accent-dark transition disabled:opacity-60"
          >
            {loading
              ? "Redirigiendo a Mercado Pago..."
              : "Contratar Programa Máster 360°"}
          </button>

          <p className="text-neutral-500 text-sm mt-2">
            El pago se realiza en soles (PEN) vía Mercado Pago. Es necesario
            iniciar sesión para contratar el servicio.
          </p>
        </div>

        <div className="hidden md:flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
            alt="Estudiar en España"
            className="w-72 opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
