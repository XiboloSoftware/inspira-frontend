// src/pages/backoffice/solicitudes/components/SolicitudHeader.jsx
import AsesoresAsignadosAdmin from "../AsesoresAsignadosAdmin";
import { formatearFecha } from "../utils";

export default function SolicitudHeader({
  detalle,
  onVolver,
  asesoresDisponibles,
  asesoresSeleccionados,
  onChangeSeleccionados,
  onGuardarAsesores,
  guardandoAsesores,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onVolver}
        className="text-xs text-[#023A4B] hover:underline mb-2"
      >
        ← Volver a solicitudes
      </button>

      <div className="mb-4">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Solicitud #{detalle.id_solicitud}
        </p>
        <h2 className="text-lg font-semibold text-neutral-900">
          {detalle.titulo || "(Sin título)"}
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Cliente:{" "}
          {detalle.cliente?.nombre
            ? `${detalle.cliente.nombre} <${detalle.cliente.email_contacto || ""}>`
            : "N/D"}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Creada el {formatearFecha(detalle.fecha_creacion)}
          {detalle.fecha_cierre && (
            <>
              {" · "}Cerrada el {formatearFecha(detalle.fecha_cierre)}
            </>
          )}
        </p>

        <AsesoresAsignadosAdmin
          asesoresDisponibles={asesoresDisponibles}
          asesoresSeleccionados={asesoresSeleccionados}
          onChangeSeleccionados={onChangeSeleccionados}
          onGuardar={onGuardarAsesores}
          guardando={guardandoAsesores}
        />
      </div>
    </>
  );
}
