// src/pages/panel/components/mis-servicios/sections/EleccionMastersCliente.jsx
import SeccionPanel from "./SeccionPanel";

export default function EleccionMastersCliente({ elecciones, setElecciones, onGuardar, saving }) {
  const lista = Array.isArray(elecciones) ? elecciones : [];

  const handleChange = (index, field, value) => {
    setElecciones(lista.map((el, i) => i === index ? { ...el, [field]: value } : el));
  };

  const handleAdd = () => {
    setElecciones([...lista, { prioridad: lista.length + 1, programa: "", comentario: "" }]);
  };

  const handleRemove = (index) => {
    if (index !== lista.length - 1 || lista.length <= 1) return;
    setElecciones(lista.slice(0, -1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar && onGuardar();
  };

  const tieneDatos = lista.some((e) => e.programa?.trim());
  const estado = tieneDatos ? "completado" : "pendiente";
  const subtitulo = tieneDatos
    ? `${lista.filter((e) => e.programa?.trim()).length} máster${lista.filter((e) => e.programa?.trim()).length > 1 ? "es" : ""} seleccionado${lista.filter((e) => e.programa?.trim()).length > 1 ? "s" : ""}`
    : "Indica a qué másteres te gustaría postular, por orden de prioridad.";

  return (
    <SeccionPanel
      numero="5"
      titulo="Elección de másteres"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="5"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {lista.map((row, index) => (
            <div key={row.prioridad ?? index} className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#023A4B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-neutral-800">Prioridad {index + 1}</p>
                </div>
                {lista.length > 1 && index === lista.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition"
                  >
                    Quitar
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Universidad y máster
                  </label>
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30 focus:border-[#023A4B] bg-white"
                    placeholder="Ej: Universidad X — Máster en Y"
                    value={row.programa || ""}
                    onChange={(e) => handleChange(index, "programa", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Comentario <span className="font-normal text-neutral-400">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30 focus:border-[#023A4B] bg-white"
                    placeholder="Motivo por el que te interesa este programa, dudas, etc."
                    value={row.comentario || ""}
                    onChange={(e) => handleChange(index, "comentario", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-neutral-300 text-neutral-700 bg-white hover:border-neutral-400 hover:bg-neutral-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Añadir máster
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition active:scale-95"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Guardar elección
              </>
            )}
          </button>
        </div>
      </form>
    </SeccionPanel>
  );
}
