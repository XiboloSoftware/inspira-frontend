// Lista de instructivos de un servicio
export default function InstructivosList({ instructivos, loading, selectedServicio, onEditar, onEliminar }) {
  if (!selectedServicio) {
    return <p className="text-sm text-neutral-500">Selecciona un servicio para ver/crear instructivos.</p>;
  }

  if (loading) return <p className="text-xs text-neutral-500">Cargando…</p>;

  if (instructivos.length === 0) {
    return <p className="text-sm text-neutral-500">Aún no hay instructivos configurados para este servicio.</p>;
  }

  return (
    <ul className="space-y-2">
      {instructivos.map((inst) => (
        <li key={inst.id_instructivo} className="border rounded-lg px-3 py-2 flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{inst.orden}. {inst.label}</span>
              {!inst.activo && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">Inactivo</span>
              )}
            </div>
            {inst.descripcion && <p className="text-xs text-neutral-600 mt-0.5">{inst.descripcion}</p>}
            {inst.archivo_url && <p className="text-[10px] text-neutral-400 mt-0.5">{inst.archivo_url}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEditar(inst)} className="px-3 py-1.5 rounded-lg border text-xs text-blue-600 hover:bg-blue-50">
              Editar
            </button>
            <button onClick={() => onEliminar(inst.id_instructivo)} className="px-3 py-1.5 rounded-lg border text-xs text-red-600 hover:bg-red-50">
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
