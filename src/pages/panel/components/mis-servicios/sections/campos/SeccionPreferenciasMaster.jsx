// src/pages/panel/components/mis-servicios/sections/campos/SeccionPreferenciasMaster.jsx

export default function SeccionPreferenciasMaster({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.6. Preferencias del máster (duración, prácticas, precio)
      </h4>

      <div className="grid gap-3">

        {/* Duración */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Duración máxima que prefieres para el máster
          </label>
          <select
            value={formData.duracion_preferida || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duracion_preferida: e.target.value,
              }))
            }
            className="w-full max-w-md rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
          >
            <option value="">Selecciona una opción</option>
            <option value="indiferente">Me da igual (1–2 años)</option>
            <option value="1">Máximo 1 año (≈ 60 ECTS)</option>
            <option value="1.5">Máximo 1,5 años</option>
            <option value="2">Máximo 2 años</option>
          </select>
        </div>

        {/* Prácticas */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Prácticas curriculares
          </p>

          <div className="grid gap-1 md:grid-cols-2">
            {[
              {
                value: "imprescindible",
                label: "Es imprescindible que el máster tenga prácticas curriculares",
              },
              {
                value: "deseable",
                label: "Me gustaría que tenga prácticas, pero no es imprescindible",
              },
              {
                value: "no_importante",
                label: "No es un criterio importante para mí",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2 text-xs text-neutral-800"
              >
                <input
                  type="radio"
                  name="practicas_preferencia"
                  value={opt.value}
                  checked={formData.practicas_preferencia === opt.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      practicas_preferencia: e.target.value,
                    }))
                  }
                  className="mt-0.5 text-[#023A4B]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Presupuesto */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Presupuesto máximo para la matrícula del máster (solo estudios)
          </p>

          <div className="grid gap-2 md:grid-cols-2 max-w-xl">
            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Desde (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.presupuesto_desde || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    presupuesto_desde: e.target.value.trim(),
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Ej: 3000"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Hasta (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.presupuesto_hasta || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    presupuesto_hasta: e.target.value.trim(),
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Ej: 9000"
              />
            </div>
          </div>

          <p className="mt-1 text-[10px] text-neutral-500 max-w-xl">
            Este dato es orientativo y nos ayuda a no proponerte másteres fuera
            de tu realidad económica.
          </p>
        </div>

      </div>
    </div>
  );
}
