// src/pages/panel/components/mis-servicios/sections/InformeBusqueda.jsx
import { formatearFecha } from "../utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function InformeBusqueda({ idSolicitud, informe }) {
  const disponible = !!informe?.informe_fecha_subida;

  async function manejarInformeCliente(modo) {
    try {
      // MISMA KEY QUE EN authHeaders() DE api.js
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No existe sesión de cliente");
        return;
      }

      const resp = await fetch(
        `${API_URL}/api/panel/solicitudes/${idSolicitud}/informe${
          modo === "ver" ? "?view=1" : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resp.ok) {
        alert("No se pudo obtener el informe");
        return;
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      if (modo === "ver") {
        // Abrir en nueva pestaña
        window.open(url, "_blank");
      } else {
        // Forzar descarga
        const a = document.createElement("a");
        a.href = url;
        a.download =
          informe?.informe_nombre_original || "informe-busqueda-masteres";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al abrir/descargar el informe");
    }
  }

  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
        4. Informe de búsqueda de másteres
      </h3>
      <p className="text-xs text-neutral-500 mb-3">
        Aquí verás el informe que prepara tu asesor con los másteres
        recomendados para tu caso.
      </p>

      {!disponible && (
        <p className="text-sm text-neutral-500">
          Aún no se ha generado tu informe. Tu asesor lo subirá cuando esté
          listo.
        </p>
      )}

      {disponible && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-neutral-700">
            <p className="font-medium">
              {informe.informe_nombre_original ||
                "Informe de búsqueda de másteres"}
            </p>
            <p className="text-neutral-500">
              Disponible desde: {formatearFecha(informe.informe_fecha_subida)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => manejarInformeCliente("ver")}
              className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
            >
              Ver informe
            </button>
            <button
              type="button"
              onClick={() => manejarInformeCliente("descargar")}
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
