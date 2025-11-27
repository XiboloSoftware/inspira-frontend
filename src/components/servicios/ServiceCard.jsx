// src/components/servicios/ServiceCard.jsx
export default function ServiceCard({
  title,
  subtitle,
  priceLabel,
  badge,
  bullets = [],
  onClick,
  ctaLabel = "Ver servicio",
}) {
  return (
    <div className="flex flex-col justify-between bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <div>
        {badge && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full mb-3">
            {badge}
          </span>
        )}

        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>

        {subtitle && (
          <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
        )}

        {priceLabel && (
          <p className="mt-4 text-xl font-bold text-neutral-900">
            {priceLabel}
          </p>
        )}

        {bullets.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-neutral-600">
            {bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        )}
      </div>

      {onClick && (
        <button
          type="button"
          onClick={onClick}
          className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-full border border-neutral-900 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
