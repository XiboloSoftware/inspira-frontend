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
        </div>

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

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-600">DNI</label>
          <input
            type="text"
            name="dni"
            value={form.dni}
            onChange={onChange}
            className="border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>

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
