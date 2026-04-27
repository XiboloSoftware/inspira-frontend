// Fila de solicitud — usada solo en la tabla desktop
export default function SolicitudRow({ s, isAdmin, onVer, onEliminar }) {
  const moneda = s.pagos?.[0]?.moneda || "";
  const totalPagado = (s.pagos || []).filter((p) => p.estado_pago === "pagado").reduce((acc, p) => acc + p.monto, 0);

  return (
    <tr className="border-b last:border-0 hover:bg-neutral-50">
      <td className="px-3 py-2 text-xs text-neutral-500">#{s.id_solicitud}</td>
      <td className="px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-900 leading-snug">{s.cliente_nombre || "Sin nombre"}</span>
          {s.cliente_email && <span className="text-[11px] text-neutral-400">{s.cliente_email}</span>}
        </div>
      </td>
      <td className="px-3 py-2 text-xs max-w-[140px]">
        {s.tipo ? <span className="inline-flex px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 whitespace-normal">{s.tipo}</span> : "—"}
      </td>
      <td className="px-3 py-2 text-xs">
        {s.estado ? <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">{s.estado}</span> : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-neutral-500 whitespace-nowrap">{s.origen || "—"}</td>
      <td className="px-3 py-2 text-xs text-neutral-500 whitespace-nowrap">
        {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString() : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-neutral-700 whitespace-nowrap">
        {totalPagado > 0 ? `${totalPagado} ${moneda}` : "0"}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onVer(s.id_solicitud)} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-light transition">
            Ver
          </button>
          {isAdmin && (
            <button type="button" onClick={() => onEliminar(s.id_solicitud)} className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition">
              Eliminar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Card para móvil — exportada para usar en SolicitudesList
export function SolicitudCard({ s, isAdmin, onVer, onEliminar }) {
  const moneda = s.pagos?.[0]?.moneda || "";
  const totalPagado = (s.pagos || []).filter((p) => p.estado_pago === "pagado").reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="p-4 border-b last:border-0 hover:bg-neutral-50 active:bg-neutral-100">
      {/* Fila superior: ID + tipo + estado */}
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-xs font-bold text-neutral-400">#{s.id_solicitud}</span>
        {s.tipo && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 leading-none">{s.tipo}</span>
        )}
        {s.estado && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 leading-none">{s.estado}</span>
        )}
        {totalPagado > 0 && (
          <span className="ml-auto text-xs text-emerald-600 font-semibold">{totalPagado} {moneda}</span>
        )}
      </div>

      {/* Nombre + email */}
      <p className="text-sm font-semibold text-neutral-900">{s.cliente_nombre || "Sin nombre"}</p>
      {s.cliente_email && <p className="text-xs text-neutral-400 mb-2">{s.cliente_email}</p>}

      {/* Footer: fecha + botones */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-neutral-400">
          {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleDateString("es-ES") : "—"}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVer(s.id_solicitud)}
            className="text-xs px-4 py-2 rounded-lg bg-primary text-white font-medium active:opacity-80 transition"
          >
            Ver
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onEliminar(s.id_solicitud)}
              className="text-xs px-4 py-2 rounded-lg border border-red-300 text-red-600 active:bg-red-50 transition"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
