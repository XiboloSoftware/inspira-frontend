// src/pages/backoffice/diagnosticos/components/BloqueEditor.jsx
export default function BloqueEditor({
  hi,
  hf,
  estado,
  idAsesor,
  asesores,
  asesorNombre,
  puedeEditarAsesor,
  setHi,
  setHf,
  setEstado,
  setIdAsesor,
  onGuardar,
  onCancelar,
  puedeLiberar,
  onLiberar,
}) {
  return (
    <div className="mt-3 border-t pt-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Hora inicio */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Hora inicio
          </label>
          <input
            type="time"
            value={hi}
            onChange={(e) => setHi(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Hora fin */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Hora fin
          </label>
          <input
            type="time"
            value={hf}
            onChange={(e) => setHf(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Asesor asignado */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Asesor asignado
          </label>

          {puedeEditarAsesor ? (
            // ADMIN: puede cambiar el trabajador
            <select
              value={idAsesor}
              onChange={(e) => setIdAsesor(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Sin asignar</option>
              {asesores.map((a) => (
                <option key={a.id_usuario} value={a.id_usuario}>
                  {a.nombre}
                </option>
              ))}
            </select>
          ) : (
            // ASESOR: solo ve el nombre, no puede tocarlo
            <div className="mt-2 text-sm text-neutral-800 font-semibold">
              {asesorNombre}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <div>
          {puedeLiberar && (
            <button
              onClick={onLiberar}
              className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded-lg mr-2"
            >
              Liberar turno
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg border text-sm text-neutral-700"
          >
            Cancelar
          </button>

          <button
            onClick={onGuardar}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
