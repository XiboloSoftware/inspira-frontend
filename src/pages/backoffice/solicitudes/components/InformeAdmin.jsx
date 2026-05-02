// src/pages/backoffice/solicitudes/components/InformeAdmin.jsx
import { useState } from "react";
import { boUpload } from "../../../../services/backofficeApi";
import { API_URL, formatearFecha } from "../utils";

export default function InformeAdmin({ detalle, recargar }) {
  const [subiendoInforme, setSubiendoInforme]   = useState(false);
  const [sheetsOpen,      setSheetsOpen]         = useState(false);
  const [sheetsUrl,       setSheetsUrl]          = useState("");
  const [sheetsStatus,    setSheetsStatus]       = useState(null); // null | "ok" | "err" | "loading"

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

  async function verificarSheets() {
    if (!sheetsUrl.trim()) return;
    setSheetsStatus("loading");
    try {
      const r = await fetch(sheetsUrl.trim());
      if (!r.ok) throw new Error("HTTP " + r.status);
      setSheetsStatus("ok");
    } catch {
      setSheetsStatus("err");
    }
  }

  const datos = detalle?.datos_formulario || {};
  const planLabel = detalle?.titulo || "Plan contratado";
  const filtros = [
    datos.comunidades_preferidas ? `${Array.isArray(datos.comunidades_preferidas) ? datos.comunidades_preferidas.join(", ") : datos.comunidades_preferidas}` : null,
    datos.presupuesto_hasta ? `Máx. ${Number(datos.presupuesto_hasta).toLocaleString("es-ES")} €` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="space-y-0 -mx-5 -mt-4 overflow-hidden">

      {/* Banner generador IA */}
      <div className="px-5 pt-4 pb-4"
        style={{ background: "linear-gradient(135deg, #1D6A4A, #1A3557)" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg shrink-0">✦</div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-white mb-0.5">Generador de Informe con IA</p>
            <p className="text-xs text-white/70">
              {filtros ? `Filtros: ${filtros}` : planLabel}
            </p>
          </div>
          {planLabel && (
            <span className="bg-[#F5C842] text-[#1A3557] text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
              📦 {planLabel}
            </span>
          )}
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSheetsOpen((v) => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/12 text-white/80 border border-white/20 hover:bg-white/20 transition"
            >
              📊 Sheets
            </button>
            <button
              type="button"
              disabled
              title="Próximamente — integración con Claude AI"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5C842] text-[#1A3557] opacity-50 cursor-not-allowed"
            >
              ✦ Generar informe
            </button>
          </div>
        </div>

        {/* Panel Sheets */}
        {sheetsOpen && (
          <div className="mt-3 bg-[#F0FDF4] border border-[#1D6A4A]/20 rounded-xl p-3">
            <p className="text-xs font-bold text-[#1D6A4A] mb-1">📊 Base de datos · Google Sheets</p>
            <p className="text-[11px] text-[#155a3d] mb-2 leading-relaxed">
              Publica el Sheet como CSV: <em>Archivo → Compartir → Publicar en la web → CSV</em>
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => { setSheetsUrl(e.target.value); setSheetsStatus(null); }}
                placeholder="URL del Sheet publicado como CSV..."
                className="flex-1 text-xs px-3 py-1.5 border border-[#1D6A4A]/30 rounded-lg outline-none focus:border-[#1D6A4A] bg-white text-neutral-800"
              />
              <button
                type="button"
                onClick={verificarSheets}
                disabled={sheetsStatus === "loading"}
                className="px-3 py-1.5 bg-[#1D6A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#155a3d] transition whitespace-nowrap disabled:opacity-60"
              >
                {sheetsStatus === "loading" ? "…" : "Verificar"}
              </button>
            </div>
            {sheetsStatus === "ok"  && <p className="text-[11px] text-[#1D6A4A] mt-1 font-mono">✓ Sheet accesible</p>}
            {sheetsStatus === "err" && <p className="text-[11px] text-red-600 mt-1 font-mono">✗ No se pudo acceder — verifica la URL</p>}
            <p className="text-[10px] text-[#155a3d] mt-2 leading-relaxed">
              Columnas: nombre_master · universidad · tipo_uni · ciudad · comunidad · precio · tipo_titulo · area · idioma_obligatorio · becas · fecha_cierre · link
            </p>
          </div>
        )}
      </div>

      {/* Informe subido (existente) */}
      <div className="px-5 pt-4 pb-2 space-y-3">
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
      </div>{/* /px-5 */}
    </div>
  );
}
