// src/pages/panel/components/mis-servicios/sections/campos/SeccionPerfilCuantitativo.jsx

export default function SeccionPerfilCuantitativo({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.1. Perfil académico cuantitativo
      </h4>

      <div className="grid gap-3">

        {/* Promedio Perú */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Promedio ponderado (escala 0–20, Perú)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={formData.promedio_peru || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, promedio_peru: e.target.value.trim() }))
            }
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs"
            placeholder="Ej: 15.75"
          />
        </div>

        {/* Otra escala */}
        <div className="border border-neutral-200 rounded-md p-2">
          <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
            <input
              type="checkbox"
              checked={!!formData.otra_escala_activa}
              onChange={(e) =>
                setFormData((p) => ({ ...p, otra_escala_activa: e.target.checked }))
              }
            />
            <span>También quiero indicar mi promedio en otra escala</span>
          </label>

          {formData.otra_escala_activa && (
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr,180px]">
              <div>
                <label className="block text-[10px] font-medium mb-1">
                  Promedio (otra escala)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.promedio_otra_escala_valor || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      promedio_otra_escala_valor: e.target.value.trim(),
                    }))
                  }
                  className="w-full border rounded-md px-2 py-1.5 text-xs"
                  placeholder="Ej: 8.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium mb-1">
                  Tipo de escala
                </label>
                <select
                  value={formData.promedio_otra_escala_tipo || ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      promedio_otra_escala_tipo: e.target.value,
                    }))
                  }
                  className="w-full border rounded-md px-2 py-1.5 text-xs"
                >
                  <option value="">Selecciona escala</option>
                  <option value="0-10">0–10</option>
                  <option value="0-4">0–4</option>
                  <option value="porcentaje">Porcentaje (0–100)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <p className="text-xs font-medium mb-1">
            ¿Estuviste en tercio, quinto o décimo superior?
          </p>

          <div className="grid gap-1 md:grid-cols-2">
            {[
              { value: "tercio", label: "Tercio superior" },
              { value: "quinto", label: "Quinto superior" },
              { value: "decimo", label: "Décimo superior" },
              { value: "ninguno", label: "No estuve en ninguno" },
            ].map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="ubicacion_grupo"
                  value={o.value}
                  checked={formData.ubicacion_grupo === o.value}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ubicacion_grupo: e.target.value }))
                  }
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Otra maestría */}
        <div>
          <p className="text-xs font-medium mb-1">¿Cuentas con otra maestría?</p>
          <div className="flex gap-3">
            {["si", "no"].map((v) => (
              <label key={v} className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  name="otra_maestria_tiene"
                  value={v}
                  checked={formData.otra_maestria_tiene === v}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, otra_maestria_tiene: v }))
                  }
                />
                <span>{v === "si" ? "Sí" : "No"}</span>
              </label>
            ))}
          </div>

          {formData.otra_maestria_tiene === "si" && (
            <div className="mt-2">
              <label className="block text-[10px] font-medium mb-1">
                Nombre de la maestría y universidad
              </label>
              <input
                type="text"
                value={formData.otra_maestria_detalle || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    otra_maestria_detalle: e.target.value,
                  }))
                }
                className="w-full border rounded-md px-2 py-1.5 text-xs"
                placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
