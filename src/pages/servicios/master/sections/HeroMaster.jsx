import { useState } from "react";
import { apiPOST } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

// Mismo servicio 002 u otro, según el plan que quieras vender aquí
const SERVICIO_MASTER_ID = 2;

export default function HeroMaster() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function manejarPago() {
    if (loading) return;
    setLoading(true);

    try {
      const r = await apiPOST("/mercadopago/servicio/preferencia", {
        id_servicio: SERVICIO_MASTER_ID,
      });

      if (r.ok && r.preferencia?.init_point) {
        window.location.href = r.preferencia.init_point;
        return;
      }

      const msg =
        r.msg ||
        r.message ||
        (!user
          ? "Debes iniciar sesión con tu cuenta de Google (arriba) antes de contratar el programa."
          : "No se pudo iniciar el pago. Inténtalo de nuevo.");
      alert(msg);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al iniciar el pago.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-secondary-light py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-secondary px-3 py-1 rounded-full text-primary text-sm font-semibold">
            Máster en España 2026/2027
          </span>

          <h1 className="text-4xl font-bold text-primary mt-3">
            Programa Máster 360°
          </h1>

          <p className="text-neutral-700 text-lg mt-4">
            Te acompañamos desde la búsqueda del máster hasta la matrícula,
            con asesoría educativa, admisión universitaria, postulación y
            seguimiento integral.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
              <div className="text-sm text-neutral-500">Admisiones logradas</div>
              <div className="text-2xl font-bold text-primary">98%</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
              <div className="text-sm text-neutral-500">Becas obtenidas</div>
              <div className="text-primary font-semibold">
                Bicentenario, U. Jaén, Fundación Carolina
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={manejarPago}
            disabled={loading}
            className="inline-block mt-7 bg-accent text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-accent-dark transition disabled:opacity-60"
          >
            {loading
              ? "Redirigiendo a Mercado Pago..."
              : "Contratar Paquete Máster 360°"}
          </button>

          <p className="text-neutral-500 text-sm mt-2">
            Pago en soles (PEN) vía Mercado Pago. Debes iniciar sesión con tu
            cuenta de Google para completar la contratación.
          </p>
        </div>

        <div className="hidden md:flex justify-center">
          <img
            src="/assets/servicios/master-hero.png"
            alt="Máster en España"
            className="w-[420px] rounded-2xl shadow"
          />
        </div>
      </div>
    </section>
  );
}
