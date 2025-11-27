export default function Hero() {
  return (
    <section className="w-full bg-secondary-light py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Tu camino a estudiar o vivir en España empieza aquí.
          </h1>

          <p className="text-neutral-700 text-lg mb-6">
            Inicia con una Asesoría de Diagnóstico de 25€. Analizamos tu caso,
            te damos un plan realista y si avanzas con un paquete, el monto se descuenta.
          </p>

          <a
            href="/diagnostico"
            className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-accent-dark transition"
          >
            Reserva tu Diagnóstico (25€)
          </a>

          <p className="text-neutral-500 text-sm mt-2">
            Cupón reembolsable si contratas un paquete.
          </p>
        </div>

        <div className="hidden md:flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
            alt="Estudiar en España"
            className="w-72 opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
