// src/pages/panel/components/mis-servicios/sections/campos/SeccionPreferenciasMaster.jsx

const MASTERS_INTERES = [
  { value: "Administración de Empresas / MBA", label: "Administración / MBA" },
  { value: "Marketing Digital y Comunicación", label: "Marketing Digital" },
  { value: "Gestión de Proyectos", label: "Gestión de Proyectos" },
  { value: "Recursos Humanos y Organización", label: "Recursos Humanos" },
  { value: "Finanzas y Banca", label: "Finanzas y Banca" },
  { value: "Comercio Internacional", label: "Comercio Internacional" },
  { value: "Derecho Internacional y RRII", label: "Derecho Internacional" },
  { value: "Derecho de Empresa", label: "Derecho de Empresa" },
  { value: "Inteligencia Artificial y Data", label: "IA / Data Science" },
  { value: "Ciberseguridad", label: "Ciberseguridad" },
  { value: "Ingeniería y Tecnología", label: "Ingeniería" },
  { value: "Arquitectura y Urbanismo", label: "Arquitectura / Urbanismo" },
  { value: "Salud Pública y Epidemiología", label: "Salud Pública" },
  { value: "Psicología y Salud Mental", label: "Psicología" },
  { value: "Educación y Docencia", label: "Educación" },
  { value: "Medio Ambiente y Sostenibilidad", label: "Medio Ambiente" },
  { value: "Ciencias Sociales y Cooperación", label: "Ciencias Sociales" },
  { value: "Arte, Diseño y Comunicación Visual", label: "Arte y Diseño" },
  { value: "Humanidades e Historia", label: "Humanidades" },
  { value: "No sé todavía / Estoy explorando", label: "🤔 Aún explorando" },
];

const COMUNIDADES = [
  "Andalucía", "Madrid", "Cataluña", "Valencia",
  "Galicia", "Castilla y León", "País Vasco", "Navarra",
];

export default function SeccionPreferenciasMaster({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  function toggleComunidad(c) {
    const current = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];
    const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    set("comunidades_preferidas", next);
  }

  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];

  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-3">
        3.6. Preferencias del máster
      </h4>

      <div className="grid gap-4">

        {/* Tipo de máster interesado — pills */}
        <div>
          <p className="text-xs font-medium text-neutral-700 mb-2">
            ¿Qué tipo de máster te interesa estudiar?
          </p>
          <p className="text-[10px] text-neutral-400 mb-2">
            Puede ser diferente a tu carrera. Ej: Ingeniería Industrial → Gestión de Proyectos.
          </p>
          <div className="flex flex-wrap gap-2">
            {MASTERS_INTERES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => set("area_interes_master", formData.area_interes_master === m.value ? "" : m.value)}
                className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                  formData.area_interes_master === m.value
                    ? "bg-[#1A3557] text-white border-[#1A3557]"
                    : "border-neutral-300 text-neutral-600 hover:border-[#023A4B] hover:text-[#023A4B]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Duración máxima que prefieres para el máster
          </label>
          <select
            value={formData.duracion_preferida || ""}
            onChange={(e) => set("duracion_preferida", e.target.value)}
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
              { value: "imprescindible", label: "Es imprescindible que el máster tenga prácticas curriculares" },
              { value: "deseable", label: "Me gustaría que tenga prácticas, pero no es imprescindible" },
              { value: "no_importante", label: "No es un criterio importante para mí" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-start gap-2 text-xs text-neutral-800">
                <input
                  type="radio"
                  name="practicas_preferencia"
                  value={opt.value}
                  checked={formData.practicas_preferencia === opt.value}
                  onChange={(e) => set("practicas_preferencia", e.target.value)}
                  className="mt-0.5"
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
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">Desde (€)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.presupuesto_desde || ""}
                onChange={(e) => set("presupuesto_desde", e.target.value.trim())}
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Ej: 3000"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">Hasta (€)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.presupuesto_hasta || ""}
                onChange={(e) => set("presupuesto_hasta", e.target.value.trim())}
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Ej: 9000"
              />
            </div>
          </div>
          <p className="mt-1 text-[10px] text-neutral-500 max-w-xl">
            Este dato es orientativo y nos ayuda a no proponerte másteres fuera de tu realidad económica.
          </p>
        </div>

        {/* Comunidades autónomas preferidas */}
        <div>
          <p className="text-xs font-medium text-neutral-700 mb-2">
            ¿Tienes alguna comunidad autónoma preferida en España? (opcional)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMUNIDADES.map((c) => (
              <label
                key={c}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer text-xs transition-all ${
                  comunidades.includes(c)
                    ? "bg-[#023A4B]/10 border-[#023A4B] text-[#023A4B] font-medium"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={comunidades.includes(c)}
                  onChange={() => toggleComunidad(c)}
                />
                <span
                  className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                    comunidades.includes(c) ? "bg-[#023A4B] border-[#023A4B]" : "border-neutral-300"
                  }`}
                >
                  {comunidades.includes(c) && (
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </span>
                {c}
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
