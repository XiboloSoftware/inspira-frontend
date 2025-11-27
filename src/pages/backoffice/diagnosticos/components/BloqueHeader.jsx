import { estadoBadgeClass, getEstadoTurnoVisual, getAsignacionTexto } from "./bloqueEstadoUtils";

export default function BloqueHeader({ bloque, onEditar, onEliminar }) {
  const estadoVisual = getEstadoTurnoVisual(bloque);
  const asignacionTexto = getAsignacionTexto(bloque);

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-primary text-lg">
            {bloque.hora_inicio} – {bloque.hora_fin}
          </span>

          <span
            className={
              "text-xs font-medium px-2.5 py-1 rounded-full " +
              estadoBadgeClass(estadoVisual.tipo)
            }
          >
            {estadoVisual.texto}
          </span>
        </div>

        <div className="text-sm text-neutral-700 mt-1 uppercase">
          {asignacionTexto}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEditar}
          className="px-3 py-1.5 rounded-lg border text-sm hover:bg-neutral-50"
        >
          Editar
        </button>
        <button
          onClick={onEliminar}
          className="px-3 py-1.5 rounded-lg border border-red-300 text-sm text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
