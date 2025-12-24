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
    <div className="flex flex-col items-end gap-1">
      <label className="inline-flex items-center justify-center px-3 py-2 text-xs rounded-lg border cursor-pointer hover:bg-neutral-50">
        {subiendo ? "Subiendo..." : "Subir documentos"}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        />
      </label>

      {error && (
        <span className="text-[11px] text-red-500 text-right max-w-[220px]">
          {error}
        </span>
      )}
    </div>
  );
}
