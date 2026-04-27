// src/pages/panel/components/checklist/BotonSubirDocumento.jsx
import { useState } from "react";
import { apiUpload } from "../../../../services/api";

export default function BotonSubirDocumento({ solicitudId, item, onUploaded }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSubiendo(true);
    setError("");

    try {
      const formData = new FormData();
      for (const f of files) formData.append("archivos", f);

      await apiUpload(
        `/api/panel/solicitudes/${solicitudId}/items/${item.id_solicitud_item}/documento`,
        formData
      );

      if (onUploaded) onUploaded();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md border border-neutral-300 bg-white cursor-pointer hover:bg-neutral-50 hover:border-neutral-400 transition text-neutral-700 whitespace-nowrap">
        {subiendo ? (
          <>
            <span className="w-2.5 h-2.5 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
            Subiendo…
          </>
        ) : (
          <>
            ↑ Subir
          </>
        )}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />
      </label>

      {error && (
        <span className="text-[10px] text-red-500 text-right max-w-[180px]">{error}</span>
      )}
    </div>
  );
}
