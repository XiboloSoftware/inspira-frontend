// src/components/servicios/ServiceSection.jsx
import ServiceCard from "./ServiceCard";

export default function ServiceSection({ title, subtitle, items = [] }) {
  return (
    <section className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-3xl">
            {subtitle}
          </p>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ServiceCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
