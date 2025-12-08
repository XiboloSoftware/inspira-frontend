// src/pages/panel/components/mis-servicios/sections/EleccionMastersCliente.jsx
export default function EleccionMastersCliente({
  elecciones,
  setElecciones,
  onGuardar,
  saving,
}) {
  // Aseguramos orden por prioridad
  const filas = [...(elecciones || [])].sort(
    (a, b) => (a.prioridad || 0) - (b.prioridad || 0)
  );

  function actualizarCampo(idx, campo, valor) {
    setElecciones((prev) => {
      const copia = [...prev];
      copia[idx] = {
        ...copia[idx],
        [campo]: valor,
      };
      return copia;
    });
  }

  function agregarFila() {
    setElecciones((prev) => {
      const maxPrioridad =
        prev.reduce((acc, it) => Math.max(acc, it.prioridad || 0), 0) || 0;
      return [
        ...prev,
        {
          prioridad: maxPrioridad + 1,
          programa: "",
          comentario: "",
        },
      ];
    });
  }

  function eliminarFila(idx) {
    setElecciones((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        5. Elección de másteres
      </h3>
      <p className="text-xs text-neutral-500 mb-3">
        Revisa el informe del bloque 4 y escribe aquí a qué másteres te gustaría
        postular, ordenados por prioridad. Puedes poner el nombre de la
        universidad y del máster tal como aparecen en el informe.
      </p>

      <div className="space-y-3">
        {filas.map((fila, idx) => (
          <div
            key={idx}
            className="border border-neutral-200 rounded-md p-2 text-xs space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-neutral-700">
                Prioridad {fila.prioridad}
              </span>
              {filas.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarFila(idx)}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>

            <div className="mt-1">
              <label className="block text-[11px] text-neutral-600 mb-0.5">
                Universidad y máster
              </label>
              <input
                type="text"
                value={fila.programa || ""}
                onChange={(e) =>
                  actualizarCampo(idx, "programa", e.target.value)
                }
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                placeholder="Ej: Universidad X – Máster en Y"
              />
            </div>

            <div className="mt-1">
              <label className="block text-[11px] text-neutral-600 mb-0.5">
                Comentario (opcional)
              </label>
              <textarea
                value={fila.comentario || ""}
                onChange={(e) =>
                  actualizarCampo(idx, "comentario", e.target.value)
                }
                rows={2}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-[11px] resize-y focus:outline-none focus:ring-1 focus:ring-[#023A4B]"
                placeholder="Motivo por el que te interesa este programa, dudas, etc."
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 gap-2">
        <button
          type="button"
          onClick={agregarFila}
          className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
        >
          Añadir otro máster (6, 7, 8…)
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={onGuardar}
          className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar elección de másteres"}
        </button>
      </div>
    </section>
  );
}
