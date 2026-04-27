// Formulario para crear/editar un instructivo
export default function InstructivoForm({ form, setForm, modo, saving, subiendoArchivo, onSubmit, onReset, onUploadArchivo }) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Título / Label</label>
        <input
          type="text"
          className="border rounded-lg px-2 py-1.5 text-sm w-full"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Descripción (opcional)</label>
        <textarea
          className="border rounded-lg px-2 py-1.5 text-sm w-full"
          rows={3}
          value={form.descripcion}
          onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Archivo</label>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center px-3 py-1.5 text-xs border rounded-lg cursor-pointer hover:bg-neutral-50">
            {subiendoArchivo ? "Subiendo…" : "Seleccionar archivo"}
            <input type="file" className="hidden" onChange={onUploadArchivo} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg" />
          </label>
          {form.archivo_url && <span className="text-[11px] text-green-700">Archivo listo</span>}
        </div>
        {form.archivo_url && <p className="text-[10px] text-neutral-400 mt-1 break-all">{form.archivo_url}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Orden</label>
          <input
            type="number"
            min={1}
            className="border rounded-lg px-2 py-1.5 text-sm w-20"
            value={form.orden}
            onChange={(e) => setForm((f) => ({ ...f, orden: Number(e.target.value) || 1 }))}
          />
        </div>
        <label className="inline-flex items-center gap-2 mt-5">
          <input type="checkbox" checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} />
          <span className="text-xs text-neutral-700">Activo</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving || subiendoArchivo} className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark disabled:opacity-60">
          {modo === "nuevo" ? "Crear instructivo" : "Guardar cambios"}
        </button>
        <button type="button" onClick={onReset} className="px-3 py-1.5 rounded-lg border text-sm text-neutral-700 hover:bg-neutral-50">
          Limpiar
        </button>
      </div>
    </form>
  );
}
