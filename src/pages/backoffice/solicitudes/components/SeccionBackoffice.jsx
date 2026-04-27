import { useState } from "react";
import { useAccordionBackoffice } from "./AccordionBackofficeContext";

const ESTADO_CFG = {
  pendiente:  { label: "Pendiente",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400"   },
  completado: { label: "Completado", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  observado:  { label: "Observado",  bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
};

export default function SeccionBackoffice({
  numero,
  titulo,
  subtitulo,
  estado,
  children,
  defaultOpen = false,
  sectionId,
}) {
  const [openInternal, setOpenInternal] = useState(defaultOpen);
  const accordion = useAccordionBackoffice();

  let open, toggle;
  if (sectionId && accordion) {
    open = accordion.openId === sectionId;
    toggle = () => accordion.setOpenId(open ? null : sectionId);
  } else {
    open = openInternal;
    toggle = () => setOpenInternal((v) => !v);
  }

  // En modo acordeón: si otra sección está abierta, esta desaparece
  if (sectionId && accordion && accordion.openId !== null && accordion.openId !== sectionId) {
    return null;
  }

  const cfg = estado ? ESTADO_CFG[estado] : null;

  return (
    <section className="border border-neutral-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {numero && (
            <div className="w-6 h-6 rounded-lg bg-[#023A4B] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{numero}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900">{titulo}</p>
            {subtitulo && (
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitulo}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cfg && (
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
          {cfg && (
            <span className={`sm:hidden w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          )}
          <svg
            className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
        <div className="border-t border-neutral-100 px-5 py-4">
          {children}
        </div>
      )}
    </section>
  );
}
