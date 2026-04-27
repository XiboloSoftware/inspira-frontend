// src/pages/panel/components/mis-servicios/sections/SeccionPanel.jsx
import { useState } from "react";
import { useAccordion } from "./AccordionContext";

const ESTADO_CFG = {
  pendiente:  { label: "Pendiente",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  completado: { label: "Completado", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  observado:  { label: "Observado",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
};

export default function SeccionPanel({
  numero,
  titulo,
  subtitulo,
  estado,
  children,
  defaultOpen = false,
  sectionId,
  // modo controlado opcional
  open: openProp,
  onToggle: onToggleProp,
}) {
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const accordion = useAccordion();

  let open, toggle;
  if (sectionId && accordion) {
    open = accordion.openId === sectionId;
    toggle = () => accordion.setOpenId(open ? null : sectionId);
  } else if (openProp !== undefined) {
    open = openProp;
    toggle = onToggleProp;
  } else {
    open = openInternal;
    toggle = () => setOpenInternal((v) => !v);
  }

  const cfg = estado ? ESTADO_CFG[estado] : null;

  return (
    <section className="border border-neutral-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header clickable */}
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-[#046C8C] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{numero}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">{titulo}</p>
            {subtitulo && (
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitulo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cfg && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-5 py-4 overflow-y-auto max-h-[55vh]">
          {children}
        </div>
      )}
    </section>
  );
}
