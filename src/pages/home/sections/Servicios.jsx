import { navigate } from "../../../services/navigate";

const educativos = [
  { label: "Paquete Máster 360º", href: "/servicios/master" },
  { label: "Paquete Grado", href: "/servicios/grado" },
  { label: "Formación Profesional (FP)", href: "/servicios/fp" },
  { label: "Homologación", href: "/servicios/homologacion" },
];

const migratorios = [
  { label: "Estancia por Estudios", href: "/servicios/estancia" },
  { label: "Visa de Estudios", href: "/servicios/visa-estudios" },
  { label: "Visa Acompañante", href: "/servicios/visa-acompanante" },
  { label: "Visa No Lucrativa", href: "/servicios/visa-no-lucrativa" },
];

// ✅ SOLO UNA VEZ
function CardServicio({ label, href }) {
  const go = (e) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={go}
      className="block bg-secondary-light hover:bg-secondary transition p-6 rounded-xl shadow border border-neutral-200"
    >
      <h4 className="text-primary font-semibold text-lg mb-2">{label}</h4>
      <p className="text-neutral-700 text-sm">Ver más detalles</p>
    </a>
  );
}

export default function Servicios() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <h2 className="text-3xl font-bold text-primary mb-2">
          Servicios disponibles
        </h2>
        <p className="text-neutral-700">
          Cada servicio incluye checklist, documentos, plazos y asesor asignado.
        </p>
      </div>

      <h3 className="text-xl font-bold text-primary mb-4 max-w-5xl mx-auto">
        Educativos
      </h3>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-14">
        {educativos.map((svc) => (
          <CardServicio key={svc.label} {...svc} />
        ))}
      </div>

      <h3 className="text-xl font-bold text-primary mb-4 max-w-5xl mx-auto">
        Migratorios
      </h3>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {migratorios.map((svc) => (
          <CardServicio key={svc.label} {...svc} />
        ))}
      </div>
    </section>
  );
}
