// Input con autocompletado para buscar clientes
export default function ClienteAutocomplete({ clientes, value, inputValue, onInput, onSelect, showSuggestions, setShowSuggestions }) {
  const sugerencias = (() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return [];
    return clientes
      .filter((c) => (c.nombre || "").toLowerCase().includes(q) || (c.email_contacto || "").toLowerCase().includes(q))
      .slice(0, 10);
  })();

  return (
    <div className="relative">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
        Cliente
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={onInput}
        onFocus={() => setShowSuggestions(true)}
        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition
          ${value
            ? "border-[#1D6A4A] focus:ring-[#1D6A4A]/20 bg-[#E8F5EE]/30"
            : "border-neutral-200 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A]"
          }`}
        placeholder="Escribe nombre o correo del cliente…"
        autoComplete="off"
      />
      {value && (
        <p className="mt-1 text-[10px] text-[#1D6A4A] font-medium">✓ Cliente seleccionado</p>
      )}
      {showSuggestions && sugerencias.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
          {sugerencias.map((c) => (
            <button
              type="button"
              key={c.id_cliente}
              onClick={() => onSelect(c)}
              className="w-full text-left px-3 py-2.5 hover:bg-[#E8F5EE] transition border-b border-neutral-50 last:border-0"
            >
              <div className="text-sm font-medium text-neutral-800">{c.nombre || "Sin nombre"}</div>
              <div className="text-xs text-neutral-400">{c.email_contacto || "Sin correo"}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
