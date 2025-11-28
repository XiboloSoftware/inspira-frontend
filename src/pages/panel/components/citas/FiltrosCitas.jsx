// src/pages/panel/components/citas/FiltrosCitas.jsx

export default function FiltrosCitas({
  filtro,
  onChange,
  totalFuturas,
  totalPasadas,
  totalCanceladas,
}) {
  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="inline-flex rounded-full bg-neutral-100 p-1 text-xs">
        <button
          type="button"
          onClick={() => onChange("proximas")}
          className={`px-3 py-1 rounded-full ${
            filtro === "proximas"
              ? "bg-white shadow text-primary font-semibold"
              : "text-neutral-600"
          }`}
        >
          Próximas ({totalFuturas})
        </button>
        <button
          type="button"
          onClick={() => onChange("historial")}
          className={`px-3 py-1 rounded-full ${
            filtro === "historial"
              ? "bg-white shadow text-primary font-semibold"
              : "text-neutral-600"
          }`}
        >
          Historial ({totalPasadas})
        </button>
        <button
          type="button"
          onClick={() => onChange("canceladas")}
          className={`px-3 py-1 rounded-full ${
            filtro === "canceladas"
              ? "bg-white shadow text-primary font-semibold"
              : "text-neutral-600"
          }`}
        >
          Canceladas ({totalCanceladas})
        </button>
      </div>
    </div>
  );
}
