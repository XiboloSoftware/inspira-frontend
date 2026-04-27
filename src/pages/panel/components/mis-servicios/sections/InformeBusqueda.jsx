// src/pages/panel/components/mis-servicios/sections/InformeBusqueda.jsx
import { formatearFecha } from "../utils";
import SeccionPanel from "./SeccionPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function InformeBusqueda({ idSolicitud, informe }) {
  const disponible = !!informe?.informe_fecha_subida;

  async function manejarInformeCliente(modo) {
    try {
      const token = localStorage.getItem("token");
      if (!token) { alert("No existe sesión de cliente"); return; }

      const resp = await fetch(
        `${API_URL}/api/panel/solicitudes/${idSolicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) { alert("No se pudo obtener el informe"); return; }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = informe?.informe_nombre_original || "informe-busqueda-masteres";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al abrir/descargar el informe");
    }
  }

  const estado = disponible ? "completado" : "pendiente";
  const subtitulo = disponible
    ? `Disponible desde ${formatearFecha(informe.informe_fecha_subida)}`
    : "Tu asesor lo subirá cuando esté listo.";

  return (
    <SeccionPanel
      numero="4"
      titulo="Informe de búsqueda de másteres"
      subtitulo={subtitulo}
      estado={estado}
      sectionId="4"
    >
      {!disponible ? (
        <div className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">En preparación</p>
            <p className="text-sm text-neutral-500 mt-0.5">Tu asesor lo subirá cuando esté listo. Te avisaremos.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {informe.informe_nombre_original || "Informe de búsqueda de másteres"}
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Disponible desde: {formatearFecha(informe.informe_fecha_subida)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => manejarInformeCliente("ver")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-[#023A4B] text-[#023A4B] bg-white hover:bg-[#023A4B] hover:text-white transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ver
            </button>
            <button
              type="button"
              onClick={() => manejarInformeCliente("descargar")}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4 4-4-4M12 4v10" />
              </svg>
              Descargar
            </button>
          </div>
        </div>
      )}
    </SeccionPanel>
  );
}
