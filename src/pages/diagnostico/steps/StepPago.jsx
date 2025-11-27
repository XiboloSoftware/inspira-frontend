import { useState } from "react";
import { apiPOST } from "../../../services/api";

export default function StepPago({ bloque, comentario, onBack }) {
  const [loading, setLoading] = useState(false);

  async function pagar() {
    if (loading) return;
    setLoading(true);

    try {
      // 1) Pre-reserva (pendiente_pago)
      const r1 = await apiPOST("/diagnostico/pre-reserva", {
        id_bloque: bloque.id_bloque,
        unidades: 1,
        comentario,
      });

      if (!r1?.ok) {
        alert(r1?.message || "Error pre-reserva");
        return;
      }

      const pre = r1.preReserva || r1.pre;
      if (!pre || !pre.id_pre_reserva) {
        alert("No se pudo crear la pre-reserva.");
        return;
      }

      localStorage.setItem("last_pre_reserva_id", String(pre.id_pre_reserva));

      // 2) Preferencia MP
      const r2 = await apiPOST("/mercadopago/preferencia", {
        titulo: "Reserva Diagnóstico",
        precio: pre.monto,
        cantidad: 1,
        orderId: pre.id_pre_reserva,
      });

      if (!r2?.ok || !r2?.preferencia) {
        alert(r2?.msg || "Error preferencia MP");
        return;
      }

      const pref = r2.preferencia;

      if (!pref.init_point) {
        alert("No se pudo obtener la URL de pago.");
        return;
      }

      // Solo una redirección
      window.location.href = pref.init_point;
    } catch (e) {
      console.error("Error inesperado al iniciar pago:", e);
      alert("Error inesperado al iniciar pago");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Pago</h2>
      <p className="mb-4">
        Horario elegido: <b>{bloque.hora_inicio} - {bloque.hora_fin}</b>
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded border" disabled={loading}>
          Volver
        </button>

        <button
          onClick={pagar}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600"
          }`}
        >
          {loading ? "Redirigiendo a Mercado Pago..." : "Ir a pagar"}
        </button>
      </div>
    </div>
  );
}
