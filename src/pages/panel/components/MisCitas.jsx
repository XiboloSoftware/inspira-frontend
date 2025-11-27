// src/pages/panel/components/MisCitas.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    setLoading(true);
    try {
      const r = await apiGET("/diagnostico/mis-citas");
      if (r.ok) {
        setCitas(r.citas || []);
      } else {
        setCitas([]);
      }
    } catch (e) {
      console.error(e);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Cargando tus citas...</p>;

  if (!citas || citas.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <p className="text-neutral-600">
          Aún no tienes citas de diagnóstico registradas.
        </p>
      </div>
    );
  }

  const ahora = new Date();
  const futuras = [];
  const pasadas = [];

  citas.forEach((c) => {
    const fechaStr = c.fecha;
    const hi = c.hora_inicio || "00:00";
    const [h, m] = hi.split(":");
    const d = new Date(fechaStr);
    if (!isNaN(d)) {
      d.setHours(Number(h || 0), Number(m || 0), 0, 0);
      if (d >= ahora) futuras.push(c);
      else pasadas.push(c);
    } else {
      futuras.push(c);
    }
  });

  function badgeEstado(estado) {
    if (!estado) return null;
    const base =
      "inline-block px-2 py-0.5 text-xs rounded-full font-medium mr-2";
    if (estado === "pendiente_pago")
      return (
        <span className={base + " bg-amber-100 text-amber-700"}>
          Pendiente de pago
        </span>
      );
    if (estado === "pagado")
      return (
        <span className={base + " bg-emerald-100 text-emerald-700"}>
          Pagado
        </span>
      );
    if (estado === "cancelado")
      return (
        <span className={base + " bg-red-100 text-red-700"}>Cancelado</span>
      );
    return (
      <span className={base + " bg-neutral-100 text-neutral-700"}>
        {estado}
      </span>
    );
  }

  function renderLista(lista, titulo) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">{titulo}</h3>
        <div className="space-y-3">
          {lista.map((c) => (
            <div
              key={c.id_pre_reserva}
              className="border border-neutral-200 rounded-xl bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
            >
              <div>
                <div className="font-semibold text-neutral-900">
                  {c.fecha}{" "}
                  {c.hora_inicio && c.hora_fin
                    ? `· ${c.hora_inicio} – ${c.hora_fin}`
                    : ""}
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Diagnóstico de inmigración
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-sm text-right">
                {badgeEstado(c.estado)}
                {c.monto && (
                  <div className="text-neutral-700 mt-1">
                    Importe: {Number(c.monto).toFixed(2)} €
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {futuras.length > 0 && renderLista(futuras, "Próximas citas")}
      {pasadas.length > 0 && renderLista(pasadas, "Historial de citas")}
    </div>
  );
}
