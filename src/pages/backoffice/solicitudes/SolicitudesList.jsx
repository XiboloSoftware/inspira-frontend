// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { getUserFromToken } from "../../../utils/auth"; // ajusta la ruta si tu archivo está en otro sitio

export default function SolicitudesList({ onVerSolicitud }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  // leemos el usuario directamente del token (incluye rol)
  const usuario = getUserFromToken();
  const esAdmin = usuario?.rol === "admin";

  // estado para crear solicitud manual
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [savingCrear, setSavingCrear] = useState(false);
  const [formCrear, setFormCrear] = useState({
    id_cliente: "",
    id_tipo_solicitud: "",
    titulo: "",
    descripcion: "",
  });

  async function cargarSolicitudes() {
    setLoading(true);
    const r = await boGET("/backoffice/solicitudes");
    if (r.ok) setSolicitudes(r.solicitudes || []);
    setLoading(false);
  }

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  function handleVerSolicitud(id) {
    if (onVerSolicitud) onVerSolicitud(id);
  }

  // ---------------- CREAR SOLICITUD MANUAL (solo admin) ----------------

  function handleChangeCrear(e) {
    const { name, value } = e.target;
    setFormCrear((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmitCrear(e) {
    e.preventDefault();
    if (savingCrear) return;

    const id_cliente = Number(formCrear.id_cliente);
    const id_tipo_solicitud = Number(formCrear.id_tipo_solicitud);

    if (!id_cliente || !id_tipo_solicitud) {
      alert("Debes indicar ID de cliente e ID de tipo de solicitud.");
      return;
    }

    setSavingCrear(true);
    try {
      const body = {
        id_cliente,
        id_tipo_solicitud,
        titulo: formCrear.titulo || null,
        descripcion: formCrear.descripcion || null,
        origen: "backoffice_manual",
      };

      const r = await boPOST("/backoffice/solicitudes", body);
      if (!r.ok) {
        alert(r.msg || "No se pudo crear la solicitud");
        return;
      }

      if (r.solicitud) {
        setSolicitudes((prev) => [r.solicitud, ...prev]);
      }

      setFormCrear({
        id_cliente: "",
        id_tipo_solicitud: "",
        titulo: "",
        descripcion: "",
      });
      setMostrarCrear(false);
      alert("Solicitud creada correctamente.");
    } finally {
      setSavingCrear(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabecera + botón crear (solo admin) */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-primary">Solicitudes</h1>

        {esAdmin && (
          <button
            type="button"
            onClick={() => setMostrarCrear((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]"
          >
            {mostrarCrear ? "Cerrar formulario" : "Crear solicitud"}
          </button>
        )}
      </div>

      <p className="text-sm text-neutral-600 mb-6">
        Expedientes generados por los clientes, incluyendo los creados
        automáticamente al pagar servicios.
      </p>

      {/* Formulario de creación (solo admin) */}
      {esAdmin && mostrarCrear && (
        <form
          onSubmit={handleSubmitCrear}
          className="mb-4 bg-white border border-neutral-200 rounded-xl shadow-sm p-4 text-xs space-y-3"
        >
          <p className="text-sm font-semibold text-neutral-800 mb-1">
            Crear solicitud manual
          </p>
          <p className="text-[11px] text-neutral-500">
            Usa este formulario para crear una solicitud sin pasar por el pago.
            De momento debes indicar el ID del cliente y el ID del tipo de
            solicitud (puedes verlos en los módulos de Clientes y Checklist
            Servicios).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">ID cliente</label>
              <input
                type="number"
                name="id_cliente"
                value={formCrear.id_cliente}
                onChange={handleChangeCrear}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                ID tipo de solicitud
              </label>
              <input
                type="number"
                name="id_tipo_solicitud"
                value={formCrear.id_tipo_solicitud}
                onChange={handleChangeCrear}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">Título</label>
              <input
                type="text"
                name="titulo"
                value={formCrear.titulo}
                onChange={handleChangeCrear}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                placeholder="Ej. Postulación en Andalucía"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={formCrear.descripcion}
                onChange={handleChangeCrear}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarCrear(false)}
              className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingCrear}
              className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
            >
              {savingCrear ? "Creando…" : "Crear solicitud"}
            </button>
          </div>
        </form>
      )}

      {/* Listado de solicitudes */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Listado de solicitudes
          </span>
          {loading && (
            <span className="text-xs text-neutral-500">Cargando…</span>
          )}
        </div>

        {(!solicitudes || solicitudes.length === 0) && !loading && (
          <p className="px-4 py-3 text-sm text-neutral-500">
            Aún no hay solicitudes registradas.
          </p>
        )}

        {solicitudes && solicitudes.length > 0 && (
          <div className="divide-y">
            {solicitudes.map((s) => (
              <div
                key={s.id_solicitud}
                className="px-4 py-3 flex justify-between items-start gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {s.titulo || "(Sin título)"}
                    </span>
                    {s.tipo && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {s.tipo}
                      </span>
                    )}
                    {s.estado && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {s.estado}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-900 font-semibold mt-0.5">
                    {s.cliente_nombre || "Cliente sin nombre"}
                  </p>
                  {s.cliente_email && (
                    <p className="text-xs text-neutral-500">
                      {s.cliente_email}
                    </p>
                  )}

                  <p className="text-xs text-neutral-500 mt-0.5">
                    Origen: {s.origen || "N/D"} ·{" "}
                    {new Date(s.fecha_creacion).toLocaleString()}
                  </p>

                  {s.total_pagado > 0 && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Total pagado: {s.total_pagado}{" "}
                      {s.pagos?.[0]?.moneda || ""}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleVerSolicitud(s.id_solicitud)}
                    className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
                  >
                    Ver solicitud
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
