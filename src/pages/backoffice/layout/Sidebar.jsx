import { useRef, useState } from "react";
import { navigate } from "../../../services/navigate";

const NAV_ITEMS = [
  { label: "Dashboard",            href: "/backoffice/dashboard" },
  { label: "Agenda",               href: "/backoffice/agenda" },
  { label: "Reservas Diagnóstico", href: "/backoffice/diagnosticos" },
  { label: "Solicitudes",          href: "/backoffice/solicitudes" },
  { label: "Documentos",           href: "/backoffice/documentos" },
  { label: "Calculadora — Leads",  href: "/backoffice/calculadora" },
  { label: "Clientes",             href: "/backoffice/clientes" },
  { label: "Precios/Servicios",    href: "/backoffice/precios" },
  { label: "Checklist Servicios",  href: "/backoffice/checklist-servicios" },
  { label: "Instructivos",         href: "/backoffice/instructivos" },
  { label: "Panel Asesoras",       href: "/backoffice/panel-asesoras" },
  { label: "Settings",             href: "/backoffice/settings" },
];

const MIN_W = 150;
const MAX_W = 380;
const DEFAULT_W = 210;

export default function Sidebar({ path, open, onClose, pinned, onTogglePin }) {
  const [width, setWidth] = useState(() => {
    const s = localStorage.getItem("bo_sidebar_w");
    const n = s ? parseInt(s, 10) : DEFAULT_W;
    return isNaN(n) ? DEFAULT_W : Math.max(MIN_W, Math.min(MAX_W, n));
  });
  const curW = useRef(width);

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = curW.current;

    function onMove(ev) {
      const next = Math.max(MIN_W, Math.min(MAX_W, startW + ev.clientX - startX));
      curW.current = next;
      setWidth(next);
    }
    function onUp() {
      localStorage.setItem("bo_sidebar_w", String(curW.current));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleNavClick(href, e) {
    // Ctrl/Cmd/Shift click → nueva pestaña (comportamiento nativo del <a>)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
    if (!pinned) onClose?.();
  }

  const sidebarInner = (
    <>
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0 gap-2">
        <a
          href="/backoffice/dashboard"
          onClick={(e) => handleNavClick("/backoffice/dashboard", e)}
          className="text-sm font-bold leading-tight hover:text-white/90 transition truncate"
        >
          Inspira Backoffice
        </a>

        <div className="flex items-center gap-1 shrink-0">
          {/* Botón pin — siempre visible cuando el sidebar está abierto */}
          <button
            onClick={onTogglePin}
            title={pinned ? "Desanclar sidebar" : "Fijar sidebar siempre visible"}
            className={`flex items-center gap-1.5 px-2 h-7 rounded-lg hover:bg-white/10 transition text-[11px] font-medium ${pinned ? "text-white" : "text-white/60"}`}
          >
            {pinned ? (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M13 9l-3 3 3 3" />
                </svg>
                <span className="hidden sm:inline">Fijo</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M11 9l3 3-3 3" />
                </svg>
                <span className="hidden sm:inline">Fijar</span>
              </>
            )}
          </button>

          {/* Cerrar — solo en modo overlay */}
          {!pinned && (
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navegación — <a> para que el click de rueda abra en nueva pestaña */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {NAV_ITEMS.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <a
              key={it.href}
              href={it.href}
              onClick={(e) => handleNavClick(it.href, e)}
              className={[
                "block w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm no-underline",
                active
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {it.label}
            </a>
          );
        })}
      </nav>

      {/* Handle de resize — arrastra para cambiar el ancho */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-white/25 active:bg-white/40 transition-colors z-10"
        title="Arrastrar para cambiar el ancho"
      />
    </>
  );

  /* ── Modo anclado (fijo, estático en el layout) ── */
  if (pinned) {
    return (
      <aside
        className="hidden lg:flex flex-col relative shrink-0 bg-primary text-white h-full overflow-hidden"
        style={{ width: `${width}px` }}
      >
        {sidebarInner}
      </aside>
    );
  }

  /* ── Modo overlay (hamburguesa) ── */
  return (
    <>
      {/* Overlay transparente para cerrar al hacer clic fuera — sin oscurecer */}
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-30"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col relative bg-primary text-white shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: `${width}px` }}
      >
        {sidebarInner}
      </aside>
    </>
  );
}
