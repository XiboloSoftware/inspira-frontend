import { useEffect, useState } from "react";
import { apiGET, apiPOST } from "../../services/api";

export default function Disponibilidad() {
  const [fecha, setFecha] = useState("");
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(false);

  async function cargar() {
    if (!fecha) return;
    setLoading(true);
    const r = await apiGET(`/diagnostico/disponibilidad?fecha=${fecha}`);
    if (r.ok) setBloques(r.bloques);
    setLoading(false);
  }

  useEffect(() => { if (fecha) cargar(); }, [fecha]);

  async function pagar(b) {
    try {
      setLoading(true);

      // 1) Crear PRE-RESERVA (pendiente_pago)
      const r1 = await apiPOST("/diagnostico/pre-reserva", {
        id_bloque: b.id_bloque,
        unidades: 1,
      });

      if (!r1.ok) throw new Error(r1.msg || "Error creando pre-reserva");

      // Backend debería devolverte: preReserva + cliente
      const preReserva = r1.preReserva; 
      const cliente = r1.cliente; // o r1.email_contacto

      // 2) Crear preferencia MP usando id_pre_reserva como orderId
      const r2 = await apiPOST("/mercadopago/preferencia", {
        titulo: "Reserva Diagnóstico",
        precio: preReserva.monto,
        cantidad: 1,
        orderId: preReserva.id_pre_reserva,  // <- clave
        email: cliente?.email_contacto,
      });

      if (!r2.ok) throw new Error(r2.msg || "Error creando preferencia MP");

      const pref = r2.preferencia;

      // 3) Guardar id_pre_reserva en localStorage para leerlo en success
      localStorage.setItem("last_pre_reserva_id", String(preReserva.id_pre_reserva));

      // 4) Redirigir a Checkout (sandbox en TEST)
      // usar SIEMPRE el init_point “normal”
      if (pref.init_point) {
        window.location.href = pref.init_point;
      } else {
        throw new Error("La preferencia no tiene init_point");
      }

    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Reserva tu diagnóstico</h2>

      <label>Elige fecha:</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      {loading && <p>Cargando…</p>}

      <div style={{ marginTop: 16 }}>
        {bloques.map((b) => (
          <div key={b.id_bloque} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
            <div><b>{b.hora_inicio} - {b.hora_fin}</b></div>
            <div>Estado: {b.estado}</div>

            <button
              disabled={b.estado !== "libre" || loading}
              onClick={() => pagar(b)}
            >
              Pagar y reservar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
