// src/pages/backoffice/solicitudes/EleccionMastersAdmin.jsx

export default function EleccionMastersAdmin({ elecciones }) {
  if (!Array.isArray(elecciones) || elecciones.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        El cliente aún no ha registrado másteres preferidos en este bloque.
      </p>
    );
  }

  const filas = [...elecciones].sort(
    (a, b) => (a.prioridad || 0) - (b.prioridad || 0)
  );

  return (
    <div className="space-y-2">
      {filas.map((fila, idx) => (
        <div
          key={idx}
          className="border border-neutral-200 rounded-md p-2 text-xs space-y-1"
        >
          <div className="flex justify-between items-center gap-2">
            <span className="text-[11px] font-semibold text-neutral-800">
              Prioridad {fila.prioridad ?? idx + 1}
            </span>
          </div>
          <p className="text-[11px] text-neutral-900">
            {fila.programa || "(Sin título)"}
          </p>
          {fila.comentario && (
            <p className="text-[11px] text-neutral-600">
              Comentario: {fila.comentario}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
