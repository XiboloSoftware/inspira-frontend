const steps = [
  "Reserva tu asesoría de diagnóstico",
  "Completa formulario previo",
  "Realiza el pago automático",
  "Sesión de diagnóstico con asesor",
  "Recomendación personalizada",
  "Contrata tu paquete ideal",
  "Accede al panel y checklist",
  "Finaliza con matrícula o visa aprobada",
];

export default function ComoFunciona() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-primary mb-4">
          ¿Cómo funciona Inspira?
        </h2>
        <p className="text-neutral-700">
          Te acompañamos desde el diagnóstico hasta la aprobación final de tu proceso.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-6 shadow rounded-xl border border-neutral-200"
          >
            <div className="text-accent text-3xl font-bold mb-2">
              {index + 1}
            </div>
            <p className="text-neutral-700">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
