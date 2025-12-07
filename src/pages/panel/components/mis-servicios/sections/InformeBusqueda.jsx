import { formatearFecha } from "../utils";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function InformeBusqueda({ idSolicitud, informe }) {
  const disponible = !!informe?.informe_fecha_subida;

  function verInforme() {
    const url = `${API_URL}/api/documentos/panel/solicitudes/${idSolicitud}/informe?view=1`;
    window.open(url, "_blank");
  }

  function descargarInforme() {
    const url = `${API_URL}/api/documentos/panel/solicitudes/${idSolicitud}/informe`;
    window.open(url, "_blank");
  }

  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        4. Informe de búsqueda de másteres
      </h3>
      <p className="text-xs text-neutral-500 mb-3">
        Aquí verás el informe que prepara tu asesor con los másteres recomendados
        para tu caso.
      </p>

      {!disponible && (
        <p className="text-sm text-neutral-500">
          Aún no se ha generado tu informe. Tu asesor lo subirá cuando esté listo.
        </p>
      )}

      {disponible && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-neutral-700">
            <p className="font-medium">
              {informe.informe_nombre_original || "Informe de búsqueda de másteres"}
            </p>
            <p className="text-neutral-500">
              Disponible desde: {formatearFecha(informe.informe_fecha_subida)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={verInforme}
              className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
            >
              Ver informe
            </button>
            <button
              type="button"
              onClick={descargarInforme}
              className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]"
            >
              Descargar informe
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
