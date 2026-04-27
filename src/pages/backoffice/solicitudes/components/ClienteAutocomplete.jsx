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
      <label className="block mb-1 font-medium text-xs">Cliente</label>
      <input
        type="text"
        value={inputValue}
        onChange={onInput}
        onFocus={() => setShowSuggestions(true)}
        className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs bg-white"
        placeholder="Escribe nombre o correo del cliente…"
      />
      {showSuggestions && sugerencias.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {sugerencias.map((c) => (
            <button
              type="button"
              key={c.id_cliente}
              onClick={() => onSelect(c)}
              className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-neutral-100"
            >
              <div className="font-medium">{c.nombre || "Sin nombre"}</div>
              <div className="text-[10px] text-neutral-500">{c.email_contacto || "Sin correo"}</div>
            </button>
          ))}
        </div>
      )}
      {value && <p className="mt-1 text-[10px] text-emerald-700">Cliente seleccionado (ID {value})</p>}
    </div>
  );
}
