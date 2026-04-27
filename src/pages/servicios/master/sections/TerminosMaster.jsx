const terminos = [
  "Asesoramiento personalizado durante todo el proceso.",
  "No garantizamos admisión: depende exclusivamente de la universidad.",
  "Tasas universitarias, homologaciones y costos administrativos son responsabilidad del cliente.",
  "El servicio está activo hasta la confirmación de inscripción o matrícula final.",
  "Soporte continuo y contacto directo con tu asesor para todas las consultas.",
];

export default function TerminosMaster() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8">
          <h2 className="text-base font-bold text-primary mb-5 flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            Términos y alcances del servicio
          </h2>
          <ul className="space-y-3">
            {terminos.map((t) => (
              <li key={t} className="flex items-start gap-3 text-neutral-600 text-sm leading-relaxed">
                <span className="text-neutral-300 flex-shrink-0 font-bold mt-0.5">—</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
