// src/pages/backoffice/diagnosticos/components/BloquesHeader.jsx
export default function BloquesHeader({
  fecha,
  setFecha,
  horaInicio,
  setHoraInicio,
  horaFin,
  setHoraFin,
  crearBloques,
  eliminarLibres,
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

        {/* Fecha */}
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Hora inicio */}
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Hora inicio</label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Hora fin */}
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Hora fin</label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-2 justify-end">
          <button
            onClick={crearBloques}
            className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-light"
          >
            Crear bloques
          </button>
          <button
            onClick={eliminarLibres}
            className="px-4 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50"
          >
            Eliminar libres
          </button>
        </div>

      </div>
    </div>
  );
}
