const beneficios = [
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Acompañamiento por expertos",
    text: "Especialistas en extranjería y educación española guiándote en cada paso.",
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Reuniones 1 a 1",
    text: "Sesiones personalizadas para avances, dudas y subsanaciones en tiempo real.",
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Seguridad jurídica",
    text: "Todos los trámites cumplen la normativa española vigente sin riesgos.",
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Gestión integral",
    text: "De documentos y CV a admisión, postulación y matrícula final en España.",
  },
];

export default function BeneficiosMaster() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#F49E4B" }}
          >
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">
            El Programa 360° es diferente
          </h2>
          <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
            Un servicio completo diseñado para maximizar tus posibilidades de admisión.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((b) => (
            <div
              key={b.title}
              className="group p-7 rounded-2xl border border-neutral-200 hover:border-accent/40 hover:shadow-lg transition-all"
            >
              <div className="text-primary mb-4 group-hover:text-accent transition-colors">
                {b.icon}
              </div>
              <h3 className="text-primary font-semibold mb-2 group-hover:text-accent transition-colors">
                {b.title}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
