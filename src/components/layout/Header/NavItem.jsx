import { navigate } from "../../../services/navigate";

export default function NavItem({ item }) {
  const base = "block py-2 text-sm font-semibold transition-colors";
  const normal = "text-primary hover:text-accent";
  const highlight = "text-accent hover:text-accent-dark";

  const go = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  if (!item.children) {
    if (item.badge) {
      return (
        <li>
          <a
            href={item.href}
            onClick={(e) => go(e, item.href)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "#1D6A4A", boxShadow: "0 2px 10px rgba(29,106,74,0.35)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
            </span>
            {item.label}
          </a>
        </li>
      );
    }

    return (
      <li>
        <a
          href={item.href}
          onClick={(e) => go(e, item.href)}
          className={`${base} ${item.highlight ? highlight : normal}`}
        >
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li className="relative group">
      {/* ✅ ahora también navega SPA */}
      <a
        href={item.href}
        onClick={(e) => go(e, item.href)}
        className={`${base} ${normal}`}
      >
        {item.label}
      </a>

      <div className="absolute left-0 top-full hidden min-w-56 rounded-xl border border-neutral-200 bg-white shadow-lg group-hover:block">
        <ul className="py-2">
          {item.children.map((child) => (
            <li key={child.label}>
              <a
                href={child.href}
                onClick={(e) => go(e, child.href)}
                className="block px-4 py-2 text-sm text-neutral-900 hover:bg-secondary-light"
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
