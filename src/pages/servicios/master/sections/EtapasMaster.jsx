const etapas = [
  {
    n: "1",
    title: "Búsqueda de máster y viabilidad",
    bullets: [
      "Entrevista inicial y análisis de perfil",
      "Informe de viabilidad",
      "Lista de centros oficiales aptos para visado",
    ],
  },
  {
    n: "2",
    title: "Guía y asesoría educativa",
    bullets: [
      "CV europeo optimizado",
      "Carta de motivación por universidad",
      "Equivalencia de notas",
      "Cartas de recomendación y kit de bienvenida",
    ],
  },
  {
    n: "3",
    title: "Postulación a másteres",
    bullets: [
      "Postulación oficial por universidad/comunidad",
      "Revisión final de documentos",
      "Seguimiento y subsanación",
      "Entrega de credenciales",
    ],
  },
  {
    n: "4",
    title: "Matrícula y admisión final",
    bullets: [
      "Revisión de carta de admisión",
      "Gestión documentaria final",
      "Asesoría en pagos y plazos",
    ],
  },
];

export default function EtapasMaster() {
  return (
    <section className="py-16 px-6 bg-secondary-light">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center">
          Etapas del Programa Máster 360°
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {etapas.map((e) => (
            <div
              key={e.n}
              className="bg-white rounded-2xl border border-neutral-200 p-6"
            >
              <div className="text-accent text-2xl font-bold">Etapa {e.n}</div>
              <h3 className="text-primary font-semibold text-lg mt-1">
                {e.title}
              </h3>
              <ul className="list-disc ml-5 mt-3 text-neutral-700 text-sm space-y-1">
                {e.bullets.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
