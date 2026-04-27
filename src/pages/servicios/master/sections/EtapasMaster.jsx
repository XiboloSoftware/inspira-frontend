const etapas = [
  {
    n: "01",
    title: "Búsqueda y viabilidad",
    bullets: [
      "Entrevista inicial y análisis de perfil",
      "Informe de viabilidad académica",
      "Lista de centros oficiales para visado",
    ],
  },
  {
    n: "02",
    title: "Guía y asesoría educativa",
    bullets: [
      "CV europeo optimizado para universidades",
      "Carta de motivación por universidad",
      "Equivalencia de notas y ranking",
      "Cartas de recomendación y kit de bienvenida",
    ],
  },
  {
    n: "03",
    title: "Postulación a másteres",
    bullets: [
      "Postulación oficial por universidad y comunidad",
      "Revisión final de documentos",
      "Seguimiento y subsanación de observaciones",
      "Entrega de credenciales de acceso",
    ],
  },
  {
    n: "04",
    title: "Matrícula y admisión final",
    bullets: [
      "Revisión de carta de admisión oficial",
      "Gestión documentaria final",
      "Asesoría en pagos de matrícula y plazos",
    ],
  },
];

export default function EtapasMaster() {
  return (
    <section className="py-20 px-6" style={{ background: "#F4F8FC" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#F49E4B" }}
          >
            El proceso
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">
            4 etapas hasta tu máster
          </h2>
          <p className="text-neutral-500 mt-3">
            Un proceso claro y estructurado con soporte experto en cada paso.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {etapas.map((e) => (
            <div
              key={e.n}
              className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                  style={{
                    background: "linear-gradient(135deg, #023A4B, #054A5E)",
                  }}
                >
                  {e.n}
                </div>
                <div className="flex-1">
                  <h3 className="text-primary font-bold text-lg mb-4">{e.title}</h3>
                  <ul className="space-y-2">
                    {e.bullets.map((x) => (
                      <li
                        key={x}
                        className="flex items-start gap-2.5 text-neutral-600 text-sm"
                      >
                        <span
                          className="flex-shrink-0 mt-0.5 font-bold"
                          style={{ color: "#F49E4B" }}
                        >
                          ✓
                        </span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
