const terminos = [
  "Asesoramiento personalizado durante todo el proceso.",
  "No garantizamos admisión: depende de la universidad.",
  "Tasas universitarias, homologaciones y costos administrativos son del cliente.",
  "El servicio dura hasta la confirmación de inscripción/matrícula.",
  "Soporte continuo y contacto directo para consultas.",
];

export default function TerminosMaster() {
  return (
    <section className="py-16 px-6 bg-secondary-light">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-primary text-center">
          Términos y alcances
        </h2>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mt-6">
          <ul className="text-neutral-700 space-y-2">
            {terminos.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
