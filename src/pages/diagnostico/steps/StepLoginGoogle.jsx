import { useEffect } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function StepLoginGoogle({ onNext }) {
  useEffect(() => {
    if (localStorage.getItem("token")) onNext();
  }, [onNext]);

  function handleLoginClick() {
  // ruta actual (incluye query y hash si hubiera)
  const current =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  // guardar destino deseado; si por alguna razón está vacío, usa "/"
  localStorage.setItem("post_login_redirect", current || "/");

  // ir a Google
  window.location.href = `${API_URL}/auth/google`;
}
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-[#E8F4FF] border border-[#9ACEFF] rounded-2xl p-6 md:p-8 mt-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#023A4B]">
          Reserva tu asesoría de diagnóstico
        </h2>

        <p className="text-[#4A4A4A] mt-2">
          Para continuar necesitas iniciar sesión. El diagnóstico es el primer
          paso de tu proceso y es <b>obligatorio</b>.
        </p>

        {/* Resumen negocio */}
        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <div className="text-sm text-[#4A4A4A]">Precio</div>
            <div className="text-xl font-bold text-[#023A4B]">
              25€ / S/.100
            </div>
            <div className="text-xs text-[#9B9B9B] mt-1">
              Pago único antes de cualquier paquete.
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5]">
            <div className="text-sm text-[#4A4A4A]">Incluye</div>
            <ul className="text-sm text-[#1A1A1A] mt-1 list-disc ml-4 space-y-1">
              <li>Análisis inicial de tu caso</li>
              <li>Recomendación del servicio ideal</li>
              <li>Cupón de 25€ válido por 72h</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button
            onClick={handleLoginClick}
            className="
              w-full sm:w-auto
              bg-[#023A4B] hover:bg-[#054256]
              text-white font-semibold
              px-5 py-3 rounded-xl
              shadow-sm transition
            "
          >
            Iniciar sesión con Google
          </button>

          <div className="text-xs text-[#9B9B9B]">
            No es compra de paquete. Solo crea tu registro para reservar y pagar
            el diagnóstico.
          </div>
        </div>
      </div>
    </div>
  );
}
