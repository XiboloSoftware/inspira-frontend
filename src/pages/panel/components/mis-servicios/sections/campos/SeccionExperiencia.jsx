// src/pages/panel/components/mis-servicios/sections/campos/SeccionExperiencia.jsx

export default function SeccionExperiencia({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.2. Experiencia profesional y vinculación
      </h4>

      <div className="grid gap-3">
        {/* Años de experiencia */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Años de experiencia profesional
          </p>
          <div className="grid gap-1 md:grid-cols-2">
            {[
              { value: "sin", label: "Sin experiencia" },
              { value: "2-3", label: "2–3 años" },
              { value: "3-5", label: "3–5 años" },
              { value: "5-10", label: "5–10 años" },
              { value: "10+", label: "Más de 10 años" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-xs text-neutral-800"
              >
                <input
                  type="radio"
                  name="experiencia_anios"
                  value={opt.value}
                  checked={formData.experiencia_anios === opt.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experiencia_anios: e.target.value,
                    }))
                  }
                  className="text-[#023A4B]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vinculación con el máster */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            ¿Tu experiencia está vinculada a los másteres que son de tu interés?
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center gap-2 text-xs text-neutral-800"
              >
                <input
                  type="radio"
                  name="experiencia_vinculada"
                  value={opt.value}
                  checked={formData.experiencia_vinculada === opt.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experiencia_vinculada: e.target.value,
                    }))
                  }
                  className="text-[#023A4B]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {formData.experiencia_vinculada === "si" && (
            <div className="mt-2">
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Cuéntanos brevemente cómo se relaciona tu experiencia con estos
                másteres
              </label>
              <textarea
                rows={3}
                value={formData.experiencia_vinculada_detalle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experiencia_vinculada_detalle: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Describe en 3–4 líneas tu experiencia relevante."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
