import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

const hoyISO = new Date().toISOString().slice(0,10);

export default function ReservasPanel() {
  const [fecha, setFecha] = useState(hoyISO);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/diagnosticos/reservas?fecha=${fecha}`);
    setLoading(false);
    if (r.ok) setReservas(r.reservas);
  }

  useEffect(()=>{ cargar(); }, [fecha]);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex gap-3 items-end">
        <div>
          <label className="text-sm text-neutral-700">Fecha</label>
          <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
            className="border rounded px-3 py-2" />
        </div>
        <button onClick={cargar}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition">
          Buscar
        </button>
      </div>

      {loading && <div className="text-neutral-700">Cargando...</div>}

      <div className="space-y-2">
        {reservas.map(r => (
          <div key={r.id_reserva} className="bg-white border border-neutral-200 rounded-xl p-3">
            <div className="flex justify-between">
              <div className="font-semibold text-primary">
                {r.bloque?.hora_inicio} - {r.bloque?.hora_fin}
              </div>
              <div className="text-sm text-neutral-700">
                {r.pago?.moneda} {r.pago?.monto} · {r.pago?.metodoPago?.nombre}
              </div>
            </div>

            <div className="text-sm text-neutral-700">
              Cliente: {r.cliente?.nombre || "—"} · {r.cliente?.email_contacto}
            </div>

            <div className="text-xs text-neutral-500">
              Estado reserva: {r.estado}
            </div>
          </div>
        ))}

        {!loading && reservas.length === 0 && (
          <div className="text-neutral-500 text-sm">No hay reservas pagadas en esta fecha.</div>
        )}
      </div>
    </div>
  );
}
