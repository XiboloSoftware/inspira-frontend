const beneficios = [
  {
    title: "Acompañamiento por expertos",
    text: "Especialistas en extranjería guiándote en cada paso.",
  },
  {
    title: "Reuniones 1 a 1",
    text: "Seguimiento personalizado para avances y dudas.",
  },
  {
    title: "Seguridad jurídica",
    text: "Trámites seguros cumpliendo normativa española.",
  },
  {
    title: "Gestión integral",
    text: "De documentos a admisión y matrícula.",
  },
];

export default function BeneficiosMaster() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-primary">
          ¿Por qué el Programa 360°?
        </h2>
        <p className="text-neutral-700 mt-2">
          Un servicio completo para asegurar una postulación competitiva.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-5 mt-10">
        {beneficios.map((b) => (
          <div
            key={b.title}
            className="bg-secondary-light border border-neutral-200 rounded-xl p-5"
          >
            <h3 className="text-primary font-semibold">{b.title}</h3>
            <p className="text-neutral-700 text-sm mt-2">{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
