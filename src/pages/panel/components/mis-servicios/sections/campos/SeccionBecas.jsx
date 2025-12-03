// src/pages/panel/components/mis-servicios/sections/campos/SeccionBecas.jsx

export default function SeccionBecas({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.5. Becas y ayudas económicas
      </h4>

      <div className="grid gap-2">
        {/* Pregunta principal */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            ¿Deseas postular a una beca o ayuda económica?
          </p>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="beca_desea"
                value="si"
                checked={formData.beca_desea === "si"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beca_desea: e.target.value,
                  }))
                }
                className="text-[#023A4B]"
              />
              <span>Sí</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="beca_desea"
                value="no"
                checked={formData.beca_desea === "no"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beca_desea: e.target.value,
                  }))
                }
                className="text-[#023A4B]"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Tipos de beca, solo si marcó "sí" */}
        {formData.beca_desea === "si" && (
          <div className="grid gap-1 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.beca_completa}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beca_completa: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Becas completas</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.beca_parcial}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beca_parcial: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Becas parciales / descuentos</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.beca_ayuda_uni}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    beca_ayuda_uni: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Ayudas de la propia universidad</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
