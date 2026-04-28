import { navigate } from "../../../services/navigate";

const go = (e, href) => {
  e.preventDefault();
  navigate(href);
};

export default function CtaFinal() {
  return (
    <section
      className="w-full py-28 px-6 text-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #023A4B 0%, #054A5E 100%)",
      }}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 85%, rgba(154,206,255,0.08) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(244,158,75,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <span
          className="text-sm font-semibold uppercase tracking-widest mb-4 block"
          style={{ color: "#F49E4B" }}
        >
          ¿Listo para comenzar?
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
          Tu camino a estudiar en España empieza aquí
        </h2>
        <p className="text-white/55 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Conoce nuestro Programa Máster 360° y descubre cómo te acompañamos
          desde la elección hasta la matrícula en universidades españolas.
        </p>
        <a
          href="/servicios/master"
          onClick={(e) => go(e, "/servicios/master")}
          className="inline-flex items-center gap-3 text-white font-bold px-10 py-5 rounded-xl text-xl transition-all hover:scale-105 hover:shadow-2xl"
          style={{ background: "#F49E4B" }}
        >
          Ver Programa Máster 360°
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
