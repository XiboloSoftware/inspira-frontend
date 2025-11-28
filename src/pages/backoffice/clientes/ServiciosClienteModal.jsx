// src/pages/backoffice/clientes/ServiciosClienteModal.jsx
import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function ServiciosClienteModal({ cliente, onClose }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/clientes/${cliente.id_cliente}/servicios`);
    if (r.ok) {
      setServicios(r.servicios || []);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-5">
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">
          Servicios de {cliente.nombre || cliente.email_contacto}
        </h2>

        {loading && (
          <p className="text-sm text-neutral-500">Cargando servicios…</p>
        )}

        {!loading && servicios.length === 0 && (
          <p className="text-sm text-neutral-500">
            Este cliente no tiene servicios registrados.
          </p>
        )}

        {!loading && servicios.length > 0 && (
          <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="border border-neutral-200 rounded-lg px-3 py-2"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-neutral-800">
                    {s.nombre_servicio}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                    {s.estado}
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  <div>
                    Fecha:{" "}
                    {new Date(s.fecha_creacion).toLocaleString()}
                  </div>
                  <div>
                    Monto: {s.monto} {s.moneda}
                  </div>
                  {s.id_pago_mp && (
                    <div>ID pago MP: {s.id_pago_mp}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-neutral-200 hover:bg-neutral-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
