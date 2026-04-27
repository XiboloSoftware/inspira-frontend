// src/pages/panel/components/mis-servicios/sections/campos/SeccionPerfilCuantitativo.jsx

const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho", label: "Derecho" },
  { value: "Ingeniería y Tecnología", label: "Ingeniería / TI" },
  { value: "Ciencias Sociales", label: "Ciencias Sociales" },
  { value: "Educación", label: "Educación" },
  { value: "Salud", label: "Salud" },
  { value: "Humanidades", label: "Humanidades" },
  { value: "Medio Ambiente", label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño", label: "Arte y Diseño" },
  { value: "Otra", label: "Otra" },
];

export default function SeccionPerfilCuantitativo({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-3">
        3.1. Perfil académico
      </h4>

      <div className="grid gap-4">

        {/* Carrera */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Carrera o título universitario
          </label>
          <input
            type="text"
            value={formData.carrera_titulo || ""}
            onChange={(e) => set("carrera_titulo", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30"
            placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…"
          />
        </div>

        {/* Área de la carrera — pills interactivos */}
        <div>
          <p className="text-xs font-medium text-neutral-700 mb-2">
            ¿A qué área pertenece tu carrera?
          </p>
          <div className="flex flex-wrap gap-2">
            {AREAS_CARRERA.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => set("area_carrera", formData.area_carrera === a.value ? "" : a.value)}
                className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                  formData.area_carrera === a.value
                    ? "bg-[#023A4B] text-white border-[#023A4B]"
                    : "border-neutral-300 text-neutral-600 hover:border-[#023A4B] hover:text-[#023A4B]"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Universidad de origen */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Universidad de origen
          </label>
          <input
            type="text"
            value={formData.universidad_origen || ""}
            onChange={(e) => set("universidad_origen", e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30"
            placeholder="Ej: PUCP, Universidad de Lima, UNMSM…"
          />
          <p className="mt-1 text-[10px] text-neutral-400">
            Tal como aparece en tu diploma o carné universitario.
          </p>
        </div>

        {/* Promedio + Escala (inline) */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Promedio universitario
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.promedio_peru || ""}
              onChange={(e) => set("promedio_peru", e.target.value.trim())}
              className="flex-1 rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30"
              placeholder="Ej: 15.75"
            />
            <select
              value={formData.promedio_escala || "20"}
              onChange={(e) => set("promedio_escala", e.target.value)}
              className="w-44 rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30"
            >
              <option value="20">Escala /20 — Perú</option>
              <option value="10">Escala /10</option>
              <option value="5">Escala /5 — Colombia</option>
              <option value="4">GPA 0–4.0</option>
              <option value="100">Porcentaje %</option>
            </select>
          </div>
        </div>

        {/* Ubicación en la promoción */}
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
                  onChange={(e) => set("ubicacion_grupo", e.target.value)}
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
                  onChange={() => set("otra_maestria_tiene", v)}
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
                onChange={(e) => set("otra_maestria_detalle", e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]/30"
                placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
