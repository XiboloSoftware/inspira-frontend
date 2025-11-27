export default function BloquesFiltroEstado({ filtro, setFiltro }) {
  const opciones = [
    { id: "todos", label: "Todos" },
    { id: "libre", label: "Libres" },
    { id: "prereservado", label: "Prereservados" },
    { id: "pagado", label: "Pagados" },
    { id: "bloqueado", label: "Bloqueados" },
  ];

  return (
    <div className="flex flex-wrap gap-2 text-sm mb-2">
      {opciones.map((o) => (
        <button
          key={o.id}
          onClick={() => setFiltro(o.id)}
          className={
            "px-3 py-1.5 rounded-full border " +
            (filtro === o.id
              ? "bg-primary text-white border-primary"
              : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
