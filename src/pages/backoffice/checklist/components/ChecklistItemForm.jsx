// Formulario para añadir un nuevo ítem al checklist
export default function ChecklistItemForm({ nuevoItem, setNuevoItem, saving, onSubmit }) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Nombre del documento</label>
        <input
          type="text"
          className="border rounded-lg px-2 py-1.5 text-sm"
          value={nuevoItem.nombre_item}
          onChange={(e) => setNuevoItem((f) => ({ ...f, nombre_item: e.target.value }))}
          placeholder="DNI escaneado, Certificado de estudios, etc."
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Descripción (opcional)</label>
        <textarea
          className="border rounded-lg px-2 py-1.5 text-sm min-h-[60px]"
          value={nuevoItem.descripcion}
          onChange={(e) => setNuevoItem((f) => ({ ...f, descripcion: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input type="checkbox" checked={nuevoItem.obligatorio} onChange={(e) => setNuevoItem((f) => ({ ...f, obligatorio: e.target.checked }))} />
          Obligatorio
        </label>
        <label className="flex items-center gap-2 text-xs text-neutral-700">
          <input type="checkbox" checked={nuevoItem.permite_archivo} onChange={(e) => setNuevoItem((f) => ({ ...f, permite_archivo: e.target.checked }))} />
          Requiere archivo adjunto
        </label>
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-light disabled:opacity-60">
          {saving ? "Guardando…" : "Añadir ítem"}
        </button>
      </div>
    </form>
  );
}
