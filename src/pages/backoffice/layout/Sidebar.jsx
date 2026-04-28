import { useRef, useState } from "react";
import { navigate } from "../../../services/navigate";

const NAV_ITEMS = [
  { label: "Dashboard",            href: "/backoffice/dashboard" },
  { label: "Agenda",               href: "/backoffice/agenda" },
  { label: "Solicitudes",          href: "/backoffice/solicitudes" },
  { label: "Documentos",           href: "/backoffice/documentos" },
  { label: "Calculadora — Leads",  href: "/backoffice/calculadora" },
  { label: "Clientes",             href: "/backoffice/clientes" },
  { label: "Precios/Servicios",    href: "/backoffice/precios" },
  { label: "Checklist Servicios",  href: "/backoffice/checklist-servicios" },
  { label: "Instructivos",         href: "/backoffice/instructivos" },
  { label: "Panel Asesoras",       href: "/backoffice/panel-asesoras" },
  { label: "Correos",              href: "/backoffice/correos" },
  { label: "Media",                href: "/backoffice/media" },
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
  const asideRef = useRef(null);
  const innerRef = useRef(null);

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = curW.current;

    // Desactivar transición y selección de texto durante el drag
    if (asideRef.current) asideRef.current.style.transition = "none";
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    function onMove(ev) {
      const next = Math.max(MIN_W, Math.min(MAX_W, startW + ev.clientX - startX));
      curW.current = next;
      // Manipulación directa del DOM — sin re-render de React
      if (asideRef.current) asideRef.current.style.width = `${next}px`;
      if (innerRef.current) innerRef.current.style.minWidth = `${next}px`;
    }

    function onUp() {
      const finalW = curW.current;
      // Restaurar transición y cursor
      if (asideRef.current) asideRef.current.style.transition = "";
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      // Sincronizar estado React y guardar solo al soltar
      setWidth(finalW);
      localStorage.setItem("bo_sidebar_w", String(finalW));
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleNavClick(href, e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
    // El cierre lo gestiona onPop en BackofficeApp según el estado pin
  }

  return (
    /* El aside SIEMPRE está en el flex layout — solo cambia el ancho.
       Cuando open=false → width=0, overflow-hidden lo oculta.
       El contenido interior mantiene minWidth para no recolapsar durante la animación. */
    <aside
      ref={asideRef}
      className="shrink-0 flex flex-col bg-primary text-white h-full overflow-hidden relative"
      style={{
        width: open ? `${width}px` : "0px",
        transition: "width 260ms ease-in-out",
      }}
    >
      {/* Contenedor interior con ancho fijo — se clipea por el aside durante animación */}
      <div ref={innerRef} className="flex flex-col h-full" style={{ minWidth: `${width}px` }}>

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
            {/* Pin/Unpin */}
            <button
              onClick={onTogglePin}
              title={pinned ? "Desanclar — se cerrará al navegar" : "Fijar — no se cerrará al navegar"}
              className={`flex items-center gap-1 px-2 h-7 rounded-lg hover:bg-white/10 transition text-[11px] font-medium ${pinned ? "text-emerald-300" : "text-white/50"}`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                {pinned
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M13 9l-3 3 3 3" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M11 9l3 3-3 3" />
                }
              </svg>
              <span>{pinned ? "Fijo" : "Fijar"}</span>
            </button>

            {/* Cerrar sidebar */}
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navegación */}
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

        {/* Handle de resize */}
        <div
          onMouseDown={startResize}
          className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-white/25 active:bg-white/40 transition-colors z-10"
          title="Arrastrar para cambiar el ancho"
        />
      </div>
    </aside>
  );
}
