const listas = [
  {
    title: "Lista 1 · Comunidades Económicas",
    price: "desde 219€",
    items: ["Andalucía, Cantabria, Asturias", "Castilla-La Mancha", "Galicia, Castilla y León"],
  },
  {
    title: "Lista 2 · Comunidades Intermedias",
    price: "desde 219€",
    items: ["La Rioja, País Vasco, Murcia", "Extremadura, Aragón", "Com. Valenciana"],
  },
  {
    title: "Lista 3 · Premium",
    price: "desde 219€",
    items: ["Cataluña", "Madrid"],
  },
];

const avanzados = [
  {
    title: "Paquete Premium",
    price: "700€",
    items: [
      "Hasta 6 comunidades a elegir",
      "Hasta +45 universidades",
      "Sin límite de listas",
      "Ideal si necesitas respaldo fuerte",
    ],
  },
  {
    title: "Paquete Infinity",
    price: "1100€",
    items: [
      "17 comunidades españolas",
      "Hasta +80 universidades",
      "Máxima cobertura (públicas + privadas)",
      "Para urgencias de visado/becas",
    ],
  },
];

export default function PlanesMaster() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-primary text-center">
          Planes de postulación
        </h2>
        <p className="text-neutral-700 text-center mt-2">
          Todos incluyen lo mismo; varía la cobertura geográfica.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {listas.map((l) => (
            <div key={l.title} className="bg-secondary-light p-6 rounded-2xl border border-neutral-200">
              <h3 className="text-primary font-semibold">{l.title}</h3>
              <div className="text-accent font-bold text-xl mt-2">{l.price}</div>
              <ul className="text-neutral-700 text-sm mt-3 space-y-1">
                {l.items.map((i) => <li key={i}>• {i}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-primary mt-12 text-center">
          Planes avanzados
        </h3>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {avanzados.map((p) => (
            <div key={p.title} className="bg-primary text-white p-7 rounded-2xl">
              <h4 className="text-xl font-semibold">{p.title}</h4>
              <div className="text-3xl font-bold text-accent mt-2">{p.price}</div>
              <ul className="text-sm mt-4 space-y-1 text-white/90">
                {p.items.map((i) => <li key={i}>• {i}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/diagnostico"
            className="inline-block bg-accent px-7 py-3 text-white rounded-xl font-semibold hover:bg-accent-dark transition"
          >
            Quiero mi plan de máster
          </a>
        </div>
      </div>
    </section>
  );
}
