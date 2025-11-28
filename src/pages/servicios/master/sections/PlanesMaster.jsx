import { useState } from "react";
import ServiceSection from "../../../../components/servicios/ServiceSection";
import ServiceCard from "../../../../components/servicios/ServiceCard";
import {
  masterAcademicSections,
  masterAdvancedPlans,
} from "../masterPlans.data";
import { usePagoServicio } from "../../../../hooks/usePagoServicio";
import ConfirmarPagoModal from "../../../../components/servicios/ConfirmarPagoModal";

export default function PlanesMaster() {
  const { pagarServicio, loadingId } = usePagoServicio();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  function abrirModal(plan) {
    setSelectedPlan(plan);
    setModalOpen(true);
  }

  function cerrarModal() {
    if (loadingId) return; // mientras redirige, no cerrar
    setModalOpen(false);
    setSelectedPlan(null);
  }

  async function confirmarPago() {
    if (!selectedPlan?.serviceId) return;
    await pagarServicio(selectedPlan.serviceId);
    // si redirige a MP, no hace falta cerrar aquí
  }

  const isLoadingSelected =
    selectedPlan && loadingId === selectedPlan.serviceId;

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

      {/* Listas 1, 2, 3 */}
      {masterAcademicSections.map((section) => (
        <section key={section.id} className="w-full py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-3xl">
                {section.subtitle}
              </p>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <ServiceCard
                  key={item.id}
                  {...item}
                  onClick={
                    item.serviceId ? () => abrirModal(item) : undefined
                  }
                  disabled={loadingId === item.serviceId}
                  ctaLabel="Contratar"
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Planes avanzados */}
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
              <ServiceCard
                key={plan.id}
                {...plan}
                onClick={
                  plan.serviceId ? () => abrirModal(plan) : undefined
                }
                disabled={loadingId === plan.serviceId}
                ctaLabel="Contratar"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modal de confirmación */}
      <ConfirmarPagoModal
        open={modalOpen}
        onClose={cerrarModal}
        plan={selectedPlan}
        onConfirm={confirmarPago}
        loading={isLoadingSelected}
      />
    </section>
  );
}
