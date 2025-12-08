// src/pages/panel/components/mis-servicios/sections/EleccionMastersCliente.jsx

export default function EleccionMastersCliente({
  elecciones,
  setElecciones,
  onGuardar,
  saving,
}) {
  const lista = Array.isArray(elecciones) ? elecciones : [];

  const handleChange = (index, field, value) => {
    const next = lista.map((el, i) =>
      i === index ? { ...el, [field]: value } : el
    );
    setElecciones(next);
  };

  const handleAdd = () => {
    const next = [
      ...lista,
      {
        prioridad: lista.length + 1,
        programa: "",
        comentario: "",
      },
    ];
    setElecciones(next);
  };

  // Solo se puede quitar la última prioridad y nunca dejar menos de 1
  const handleRemove = (index) => {
    const isLast = index === lista.length - 1;
    if (!isLast) return;
    if (lista.length <= 1) return;

    const next = lista.slice(0, -1);
    setElecciones(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar && onGuardar();
  };

  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        5. Elección de másteres
      </h3>
      <p className="text-xs text-neutral-600 mb-2">
        Revisa el informe del bloque 4 y escribe aquí a qué másteres te
        gustaría postular, ordenados por prioridad. Puedes poner el nombre de
        la universidad y del máster tal como aparecen en el informe.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* LISTA CON SCROLL */}
        <div className="border border-neutral-200 rounded-md max-h-72 overflow-y-auto pr-1">
          <div className="divide-y divide-neutral-100">
            {lista.map((row, index) => (
              <div key={row.prioridad ?? index} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-neutral-800">
                    Prioridad {index + 1}
                  </p>

                  {/* Quitar solo si es la última y hay más de una */}
                  {lista.length > 1 && index === lista.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="text-[11px] px-2 py-1 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-neutral-600">
                    Universidad y máster
                  </label>
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                    placeholder="Ej: Universidad X – Máster en Y"
                    value={row.programa || ""}
                    onChange={(e) =>
                      handleChange(index, "programa", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-neutral-600">
                    Comentario (opcional)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs resize-y focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                    placeholder="Motivo por el que te interesa este programa, dudas, etc."
                    value={row.comentario || ""}
                    onChange={(e) =>
                      handleChange(index, "comentario", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            {lista.length === 0 && (
              <div className="p-3">
                <p className="text-xs text-neutral-500">
                  El cliente aún no ha registrado másteres preferidos en este
                  bloque.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTONES ABAJO */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleAdd}
            className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 self-start"
          >
            Añadir otro máster
          </button>

          <button
            type="submit"
            disabled={saving}
            className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60 self-end"
          >
            {saving ? "Guardando…" : "Guardar elección de másteres"}
          </button>
        </div>
      </form>
    </section>
  );
}
