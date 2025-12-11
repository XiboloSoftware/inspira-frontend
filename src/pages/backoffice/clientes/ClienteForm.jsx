// src/pages/backoffice/clientes/ClienteForm.jsx

export default function ClienteForm({
  form,
  modo,
  onChange,
  onSubmit,
  onCancel,
  saving,
}) {
  const titulo = modo === "editar" ? "Editar cliente" : "Nuevo cliente";

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-800">{titulo}</h2>
        {modo === "editar" && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            Limpiar formulario
          </button>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
      >
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Nombre y apellidos</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Correo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Correo</label>
          <input
            type="email"
            name="email_contacto"
            value={form.email_contacto}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
            required
          />
          <p className="text-[11px] text-neutral-400">
            Debe ser único. No se permiten dos clientes con el mismo correo.
          </p>
        </div>

        {/* Teléfono */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Número celular</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
            placeholder="+51 9..."
          />
        </div>

        {/* País de origen */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">País de origen</label>
          <input
            type="text"
            name="pais_origen"
            value={form.pais_origen || ""}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
            placeholder="Perú, Colombia, México..."
          />
        </div>

        {/* DNI */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">DNI / documento nacional</label>
          <input
            type="text"
            name="dni"
            value={form.dni}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Pasaporte */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Pasaporte</label>
          <input
            type="text"
            name="pasaporte"
            value={form.pasaporte || ""}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Canal de origen */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">Canal de origen</label>
          <select
            name="canal_origen"
            value={form.canal_origen || ""}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
          >
            <option value="">Selecciona…</option>
            <option value="web">Web / Landing</option>
            <option value="referido">Referido</option>
            <option value="redes">Redes sociales</option>
            <option value="evento">Evento / taller</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Activo (solo en editar) */}
        {modo === "editar" && (
          <div className="flex items-center gap-2 mt-4">
            <input
              id="activo"
              type="checkbox"
              checked={!!form.activo}
              onChange={(e) =>
                onChange({
                  target: {
                    name: "activo",
                    value: e.target.checked,
                  },
                })
              }
              className="h-4 w-4"
            />
            <label htmlFor="activo" className="text-xs text-neutral-700">
              Cliente activo
            </label>
          </div>
        )}

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs bg-primary text-white rounded-lg disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
