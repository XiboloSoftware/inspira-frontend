// src/pages/servicios/master/sections/PlanesMaster.jsx
import ServiceSection from "../../../../components/servicios/ServiceSection";
import ServiceCard from "../../../../components/servicios/ServiceCard";
import {
  masterAcademicSections,
  masterAdvancedPlans,
} from "../masterPlans.data";

export default function PlanesMaster() {
  return (
    <section className="w-full bg-neutral-50 py-14">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900">
            Planes de postulación para tu máster
          </h2>
          <p className="mt-3 text-sm md:text-base text-neutral-600 max-w-3xl mx-auto">
            Todos los paquetes incluyen búsqueda de centros oficiales, revisión
            documentaria, postulación a másteres, seguimiento y asesoría para la
            matrícula. Lo que cambia es el alcance geográfico y la cantidad de
            universidades.
          </p>
        </header>
      </div>

      {/* Secciones por listas (económicas / intermedias / premium) */}
      {masterAcademicSections.map((section) => (
        <ServiceSection
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          items={section.items}
        />
      ))}

      {/* Planes avanzados Premium / Infinity */}
      <section className="w-full py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900">
            Planes avanzados
          </h3>
          <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-3xl">
            Para quienes necesitan la máxima cobertura de comunidades y
            universidades o una estrategia de admisión acelerada.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {masterAdvancedPlans.map((plan) => (
              <ServiceCard key={plan.id} {...plan} />
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/diagnostico"
              className="inline-block bg-accent px-7 py-3 text-white rounded-full font-semibold hover:bg-accent-dark transition"
            >
              Quiero mi plan de máster
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}
