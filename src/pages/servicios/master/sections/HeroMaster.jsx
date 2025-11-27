export default function HeroMaster() {
  return (
    <section className="w-full bg-secondary-light py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-secondary px-3 py-1 rounded-full text-primary text-sm font-semibold">
            Máster en España 2026/2027
          </span>

          <h1 className="text-4xl font-bold text-primary mt-3">
            Programa Máster 360°
          </h1>

          <p className="text-neutral-700 text-lg mt-4">
            Te acompañamos desde la búsqueda del máster hasta la matrícula,
            con asesoría educativa + admisión universitaria + postulación + seguimiento integral.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
              <div className="text-sm text-neutral-500">Admisiones logradas</div>
              <div className="text-2xl font-bold text-primary">98%</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
              <div className="text-sm text-neutral-500">Becas obtenidas</div>
              <div className="text-primary font-semibold">
                Bicentenario, U. Jaén, Fundación Carolina
              </div>
            </div>
          </div>

          <a
            href="/diagnostico"
            className="inline-block mt-7 bg-accent text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-accent-dark transition"
          >
            Empezar con Diagnóstico (25€)
          </a>
        </div>

        <div className="hidden md:flex justify-center">
          <img
            src="/assets/servicios/master-hero.png"
            alt="Máster en España"
            className="w-[420px] rounded-2xl shadow"
          />
        </div>
      </div>
    </section>
  );
}
