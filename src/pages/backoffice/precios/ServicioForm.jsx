// src/pages/backoffice/precios/ServicioForm.jsx

export default function ServicioForm({
  modo,
  form,
  setForm,
  saving,
  onSubmit,
  onReset,
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm sticky top-6">
      <h2 className="text-sm font-semibold text-neutral-800 mb-3">
        {modo === "nuevo" ? "Nuevo servicio" : "Editar servicio y precio"}
      </h2>

      <form className="space-y-3" onSubmit={onSubmit}>
        {/* Código interno */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">
            Código interno
            <span className="text-[10px] text-neutral-400 ml-1">(generado automáticamente)</span>
          </label>
          <input
            type="text"
            className="border rounded-lg px-2 py-1.5 text-sm bg-neutral-50"
            value={form.codigo || ""}
            disabled
            readOnly
          />
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Nombre</label>
          <input
            type="text"
            className="border rounded-lg px-2 py-1.5 text-sm"
            value={form.nombre}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre: e.target.value }))
            }
            required
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Descripción (opcional)</label>
          <textarea
            className="border rounded-lg px-2 py-1.5 text-sm min-h-[60px]"
            value={form.descripcion}
            onChange={(e) =>
              setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          />
        </div>

        {/* Moneda + monto */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Moneda</label>
            <select
              className="border rounded-lg px-2 py-1.5 text-sm"
              value={form.moneda}
              onChange={(e) =>
                setForm((f) => ({ ...f, moneda: e.target.value }))
              }
            >
              <option value="EUR">EUR</option>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs text-neutral-500">Monto</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border rounded-lg px-2 py-1.5 text-sm"
              value={form.monto}
              onChange={(e) =>
                setForm((f) => ({ ...f, monto: e.target.value }))
              }
              required
            />
          </div>
        </div>

        {/* Activo */}
        {modo === "editar" && (
          <div className="flex items-center gap-2 pt-1">
            <input
              id="activo"
              type="checkbox"
              checked={form.activo}
              onChange={(e) =>
                setForm((f) => ({ ...f, activo: e.target.checked }))
              }
            />
            <label htmlFor="activo" className="text-xs text-neutral-600">
              Servicio activo
            </label>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-between pt-2">
          {modo === "editar" ? (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border text-xs hover:bg-neutral-50"
            >
              Nuevo servicio
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-light disabled:opacity-60"
          >
            {saving ? "Guardando…" : modo === "nuevo" ? "Crear" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
