// Lista de ítems de checklist de un servicio
export default function ChecklistItemsList({ etapa, onActualizar, onEliminar }) {
  if (!etapa) {
    return <p className="text-sm text-neutral-500">Aún no hay etapa de checklist. Se creará al añadir el primer ítem.</p>;
  }

  if (etapa.items.length === 0) {
    return <p className="text-sm text-neutral-500">No hay ítems definidos. Agrega los documentos requeridos.</p>;
  }

  return (
    <div className="space-y-3">
      {etapa.items.map((item) => (
        <div key={item.id_item} className="border border-neutral-200 rounded-lg px-3 py-2 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-900">{item.nombre_item}</span>
              {item.obligatorio && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600">Obligatorio</span>
              )}
            </div>
            {item.descripcion && <p className="text-xs text-neutral-500 mt-0.5">{item.descripcion}</p>}
            <p className="text-[11px] text-neutral-500 mt-1">
              {item.permite_archivo ? "Requiere archivo adjunto." : "Solo verificación, sin archivo."}
            </p>
          </div>

          <div className="flex flex-col gap-1 items-end shrink-0">
            <button onClick={() => onActualizar(item.id_item, { obligatorio: !item.obligatorio })} className="text-[11px] px-2 py-1 rounded border hover:bg-neutral-50">
              {item.obligatorio ? "Marcar como opcional" : "Marcar como obligatorio"}
            </button>
            <button onClick={() => onActualizar(item.id_item, { permite_archivo: !item.permite_archivo })} className="text-[11px] px-2 py-1 rounded border hover:bg-neutral-50">
              {item.permite_archivo ? "Sin archivo" : "Requiere archivo"}
            </button>
            <button onClick={() => onEliminar(item.id_item)} className="text-[11px] px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
