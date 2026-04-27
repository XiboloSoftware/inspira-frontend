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
      if (!r.ok) { alert(r.msg || "No se pudo subir el informe"); return; }
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {detalle.informe_fecha_subida ? (
          <p className="text-xs text-neutral-500">
            Subido el{" "}
            <span className="font-medium text-neutral-700">{formatearFecha(detalle.informe_fecha_subida)}</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-500">Aún no se ha subido el informe de búsqueda de másteres.</p>
        )}
        <label className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer font-medium transition">
          {subiendoInforme ? "Subiendo…" : "Subir / reemplazar informe"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
            onChange={handleUploadInforme}
          />
        </label>
      </div>

      {detalle.informe_fecha_subida && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-100 rounded-xl bg-neutral-50 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">
              {detalle.informe_nombre_original || "Informe de búsqueda"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Última actualización: {formatearFecha(detalle.informe_fecha_subida)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => manejarInformeAdmin("ver")}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-white transition"
            >
              Ver
            </button>
            <button
              type="button"
              onClick={() => manejarInformeAdmin("descargar")}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition"
            >
              Descargar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
