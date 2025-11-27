import { useState } from "react";
import { apiPOST } from "../../../services/api";

export default function StepPago({ bloque, comentario, onBack }) {
  const [loading, setLoading] = useState(false);

  async function pagar() {
    if (loading) return;            // ✅ evita doble ejecución
    setLoading(true);

    try {
      // 1) Pre-reserva (pendiente_pago)
      const r1 = await apiPOST("/diagnostico/pre-reserva", {
        id_bloque: bloque.id_bloque,
        unidades: 1,
        comentario,
      });

      if (!r1.ok) {
        alert(r1.message || "Error pre-reserva");
        setLoading(false);
        return;
      }

      const pre = r1.preReserva || r1.pre;
      localStorage.setItem("last_pre_reserva_id", String(pre.id_pre_reserva));

      // 2) Preferencia MP
      const r2 = await apiPOST("/mercadopago/preferencia", {
        titulo: "Reserva Diagnóstico",
        precio: pre.monto,
        cantidad: 1,
        orderId: pre.id_pre_reserva,
      });

      if (!r2.ok) {
        alert(r2.msg || "Error preferencia MP");
        setLoading(false);
        return;
      }

      const url =
        r2.preferencia.sandbox_init_point || r2.preferencia.init_point;

      // ✅ ya no necesitas seguir en la app, MP toma el control
      window.location.href = url;
    } catch (e) {
      alert("Error inesperado al iniciar pago");
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
