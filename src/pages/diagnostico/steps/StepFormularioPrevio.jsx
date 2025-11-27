export default function StepFormularioPrevio({
  comentario,
  setComentario,
  onBack,
  onNext
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Cuéntanos brevemente tu motivo (opcional)</h2>
      <p className="text-gray-600 mb-4">
        Puedes escribir un mensaje para que el especialista llegue con contexto.
      </p>

      <textarea
        rows={5}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full border rounded p-3"
        placeholder="Ej: Quiero una orientación sobre..."
      />

      <div className="flex gap-3 mt-4">
        <button onClick={onBack} className="px-4 py-2 rounded border">
          Volver
        </button>
        <button onClick={onNext} className="px-4 py-2 rounded bg-slate-900 text-white">
          Siguiente
        </button>
      </div>
    </div>
  );
}
