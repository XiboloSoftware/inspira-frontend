// src/pages/backoffice/solicitudes/components/ProgresoExpediente.jsx
// Barra horizontal de progreso que muestra los 7 bloques del expediente con su estado.

const ESTADO_DOT = {
  completado: { dot: "bg-[#1D6A4A]",   ring: "bg-[#1D6A4A]",   text: "text-[#1D6A4A]",   badge: "bg-[#E8F5EE] text-[#155a3d]" },
  pendiente:  { dot: "bg-amber-400",    ring: "bg-amber-400",   text: "text-amber-600",   badge: "bg-amber-50 text-amber-700"  },
  observado:  { dot: "bg-red-500",      ring: "bg-red-500",     text: "text-red-600",     badge: "bg-red-50 text-red-700"      },
  inactivo:   { dot: "bg-neutral-300",  ring: "bg-neutral-200", text: "text-neutral-400", badge: "bg-neutral-100 text-neutral-400" },
};

function calcProgreso(bloques) {
  const total = bloques.length;
  const completos = bloques.filter((b) => b.estado === "completado").length;
  return total > 0 ? Math.round((completos / total) * 100) : 0;
}

export default function ProgresoExpediente({ bloques, onIrA }) {
  const pct = calcProgreso(bloques);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm px-4 py-3 shrink-0">
      {/* Cabecera: anillo + título */}
      <div className="flex items-center gap-3 mb-3">
        {/* Anillo SVG */}
        <div className="relative w-10 h-10 shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
            <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(29,106,74,.12)" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="15"
              fill="none"
              stroke="#1D6A4A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="94.2"
              strokeDashoffset={94.2 - (94.2 * pct) / 100}
              style={{ transition: "stroke-dashoffset .6s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#1D6A4A] font-mono">
            {pct}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900">Progreso del expediente</p>
          <p className="text-xs text-neutral-500">
            {bloques.filter((b) => b.estado === "completado").length} de {bloques.length} bloques completos
          </p>
        </div>
      </div>

      {/* Bloques como pills horizontales (scroll en móvil) */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {bloques.map((bloque) => {
          const cfg = ESTADO_DOT[bloque.estado] || ESTADO_DOT.inactivo;
          return (
            <button
              key={bloque.id}
              type="button"
              onClick={() => onIrA?.(bloque.id)}
              title={bloque.titulo}
              className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg border transition-all hover:shadow-sm active:scale-95
                ${bloque.estado === "completado"
                  ? "border-[#1D6A4A]/25 bg-[#E8F5EE]"
                  : bloque.estado === "pendiente"
                    ? "border-amber-200 bg-amber-50"
                    : bloque.estado === "observado"
                      ? "border-red-200 bg-red-50"
                      : "border-neutral-200 bg-neutral-50"}`}
            >
              {/* Número */}
              <span className={`text-[10px] font-bold font-mono w-4 text-center ${cfg.text}`}>
                {bloque.numero}
              </span>
              {/* Label (oculto en móvil muy pequeño) */}
              <span className={`hidden sm:block text-[11px] font-medium ${cfg.text} whitespace-nowrap max-w-[80px] truncate`}>
                {bloque.label}
              </span>
              {/* Dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
