// src/pages/backoffice/solicitudes/components/InformeAdmin.jsx
import { useState } from "react";
import { boUpload } from "../../../../services/backofficeApi";
import { API_URL, formatearFecha } from "../utils";

export default function InformeAdmin({ detalle, recargar }) {
  const [subiendoInforme, setSubiendoInforme] = useState(false);

  async function handleUploadInforme(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoInforme(true);

    try {
      const r = await boUpload(`/api/admin/solicitudes/${detalle.id_solicitud}/informe`, file);
      if (!r.ok) {
        alert(r.msg || "No se pudo subir el informe");
        return;
      }
      await recargar();
    } finally {
      setSubiendoInforme(false);
    }
  }

  async function manejarInformeAdmin(modo) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) return alert("No existe sesión de backoffice");

      const resp = await fetch(
        `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!resp.ok) return alert("No se pudo obtener el informe");

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);

      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = detalle.informe_nombre_original || "informe";
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
    <section className="border border-neutral-200 rounded-lg p-3 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-neutral-900">
          4. Informe de búsqueda de másteres
        </h3>

        <div className="flex items-center gap-2">
          {detalle.informe_fecha_subida && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
              Informe subido el {formatearFecha(detalle.informe_fecha_subida)}
            </span>
          )}

          <label className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer">
            {subiendoInforme ? "Subiendo…" : "Subir / reemplazar informe"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
              onChange={handleUploadInforme}
            />
          </label>
        </div>
      </div>

      {!detalle.informe_fecha_subida ? (
        <p className="text-xs text-neutral-500">
          Aún no se ha subido el informe de búsqueda de másteres para esta solicitud.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs text-neutral-700">
            <p className="font-medium">
              {detalle.informe_nombre_original || "Informe de búsqueda"}
            </p>
            <p className="text-neutral-500">
              Última actualización: {formatearFecha(detalle.informe_fecha_subida)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => manejarInformeAdmin("ver")}
              className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
            >
              Ver informe
            </button>
            <button
              type="button"
              onClick={() => manejarInformeAdmin("descargar")}
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
