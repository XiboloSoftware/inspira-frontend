// Fila de una solicitud en la tabla
export default function SolicitudRow({ s, isAdmin, onVer, onEliminar }) {
  const moneda = s.pagos?.[0]?.moneda || "";
  const totalPagado = (s.pagos || []).filter((p) => p.estado_pago === "pagado").reduce((acc, p) => acc + p.monto, 0);

  return (
    <tr className="border-b last:border-0 hover:bg-neutral-50">
      <td className="px-3 py-2 text-xs text-neutral-700">#{s.id_solicitud}</td>
      <td className="px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-900">{s.cliente_nombre || "Cliente sin nombre"}</span>
          {s.cliente_email && <span className="text-[11px] text-neutral-500">{s.cliente_email}</span>}
        </div>
      </td>
      <td className="px-3 py-2 text-xs">
        {s.tipo ? <span className="inline-flex px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">{s.tipo}</span> : "—"}
      </td>
      <td className="px-3 py-2 text-xs">
        {s.estado ? <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{s.estado}</span> : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-neutral-600">{s.origen || "N/D"}</td>
      <td className="px-3 py-2 text-xs text-neutral-600">
        {s.fecha_creacion ? new Date(s.fecha_creacion).toLocaleString() : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-neutral-700">
        {totalPagado > 0 ? `${totalPagado} ${moneda}` : "0"}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => onVer(s.id_solicitud)} className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50">
            Ver
          </button>
          {isAdmin && (
            <button type="button" onClick={() => onEliminar(s.id_solicitud)} className="text-[11px] px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
