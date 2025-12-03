// src/pages/panel/components/mis-servicios/sections/campos/SeccionComentarioEspecial.jsx

export default function SeccionComentarioEspecial({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.7. Comentario especial para IA / asesores
      </h4>

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          Comentario especial sobre tu caso (opcional)
        </label>
        <textarea
          rows={5}
          value={formData.comentario_especial || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              comentario_especial: e.target.value,
            }))
          }
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
          placeholder="Cuéntanos cualquier detalle importante (situación familiar, tiempos, si quieres luego hacer doctorado, si no puedes mudarte de ciudad, etc.). Este comentario también ayudará a la IA a priorizar los másteres para tu informe."
        />
      </div>
    </div>
  );
}
