// src/pages/panel/components/mis-servicios/sections/campos/SeccionIdiomas.jsx

export default function SeccionIdiomas({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.4. Idiomas y certificaciones
      </h4>

      <div className="grid gap-3">
        {/* Situación de inglés */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Situación actual de inglés
          </p>

          <div className="space-y-1">
            {/* Univ */}
            <label className="flex items-start gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="uni"
                checked={formData.ingles_situacion === "uni"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingles_situacion: e.target.value,
                  }))
                }
                className="mt-0.5 text-[#023A4B]"
              />
              <span>
                Tengo certificación de inglés emitida por mi universidad
              </span>
            </label>

            {formData.ingles_situacion === "uni" && (
              <div className="ml-5 mt-1">
                <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                  Nivel
                </label>
                <select
                  value={formData.ingles_uni_nivel || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ingles_uni_nivel: e.target.value,
                    }))
                  }
                  className="w-full max-w-[180px] rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                >
                  <option value="">Selecciona nivel</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            )}

            {/* Intl */}
            <label className="flex items-start gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="intl"
                checked={formData.ingles_situacion === "intl"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingles_situacion: e.target.value,
                  }))
                }
                className="mt-0.5 text-[#023A4B]"
              />
              <span>
                Tengo certificación internacional (IELTS, TOEFL, Cambridge, etc.)
              </span>
            </label>

            {formData.ingles_situacion === "intl" && (
              <div className="ml-5 mt-1 grid gap-2 md:grid-cols-[1fr,1fr]">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Tipo de certificación
                  </label>
                  <select
                    value={formData.ingles_intl_tipo || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_intl_tipo: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                  >
                    <option value="">Selecciona</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="Cambridge">Cambridge</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Puntaje o nivel
                  </label>
                  <input
                    type="text"
                    value={formData.ingles_intl_puntaje || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_intl_puntaje: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    placeholder="Ej: 6.5, 90, C1"
                  />
                </div>
              </div>
            )}

            {/* Instituto */}
            <label className="flex items-start gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="instituto"
                checked={formData.ingles_situacion === "instituto"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingles_situacion: e.target.value,
                  }))
                }
                className="mt-0.5 text-[#023A4B]"
              />
              <span>Tengo inglés de instituto (sin certificación oficial)</span>
            </label>

            {/* Sé inglés sin cert */}
            <label className="flex items-start gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="sin_cert"
                checked={formData.ingles_situacion === "sin_cert"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingles_situacion: e.target.value,
                  }))
                }
                className="mt-0.5 text-[#023A4B]"
              />
              <span>Sé inglés pero aún no lo he certificado</span>
            </label>

            {/* No inglés */}
            <label className="flex items-start gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="no"
                checked={formData.ingles_situacion === "no"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ingles_situacion: e.target.value,
                  }))
                }
                className="mt-0.5 text-[#023A4B]"
              />
              <span>No tengo inglés</span>
            </label>
          </div>
        </div>

        {/* Idioma del máster */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Idioma del máster que prefieres
          </p>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.idioma_master_es}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idioma_master_es: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Solo en español</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.idioma_master_bilingue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idioma_master_bilingue: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Acepto máster bilingüe (español + inglés)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.idioma_master_ingles}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idioma_master_ingles: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Acepto máster totalmente en inglés</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
