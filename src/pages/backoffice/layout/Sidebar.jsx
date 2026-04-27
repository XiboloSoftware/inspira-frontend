import { navigate } from "../../../services/navigate";

const items = [
  { label: "Dashboard", href: "/backoffice/dashboard" },
  { label: "Agenda", href: "/backoffice/agenda" },
  { label: "Reservas Diagnóstico", href: "/backoffice/diagnosticos" },
  { label: "Solicitudes", href: "/backoffice/solicitudes" },
  { label: "Documentos", href: "/backoffice/documentos" },
  { label: "Calculadora — Leads", href: "/backoffice/calculadora" },
  { label: "Clientes", href: "/backoffice/clientes" },
  { label: "Precios/Servicios", href: "/backoffice/precios" },
  { label: "Checklist Servicios", href: "/backoffice/checklist-servicios" },
  { label: "Instructivos", href: "/backoffice/instructivos" },
  { label: "Panel Asesoras", href: "/backoffice/panel-asesoras" },
  { label: "Settings", href: "/backoffice/settings" },
];

export default function Sidebar({ path }) {
  return (
    <aside className="w-64 bg-primary text-white h-full px-4 py-6 flex-shrink-0 overflow-y-auto">
      <div
        className="text-2xl font-bold mb-8 cursor-pointer"
        onClick={() => navigate("/backoffice/dashboard")}
      >
        Inspira Backoffice
      </div>

      <nav className="space-y-1">
        {items.map((it) => {
          const active = path.startsWith(it.href);
          return (
            <button
              key={it.href}
              onClick={() => navigate(it.href)}
              className={`w-full text-left px-3 py-2 rounded-lg transition
                ${active ? "bg-primary-light" : "hover:bg-primary-light/70"}
              `}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
