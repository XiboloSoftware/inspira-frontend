// src/pages/metodo/MetodoInspira.jsx
//
// EL MÉTODO INSPIRA — la página que explica el modelo comercial de la firma.
//
// No es una landing de campaña: es el elemento de marca al que apuntan los
// flyers, las propuestas y los presupuestos. Por eso vive dentro del sitio
// (con cabecera, pie e indexable) y no como landing standalone de ads.
//
// La tesis, en una línea: nadie paga un proceso migratorio de golpe. Se paga
// por etapas, y cada etapa solo se abre cuando la anterior dio resultado.
// Admisión → Carta → Visado → Llegada.
//
// Todos los importes salen de config/metodo.js. Aquí no se escribe ni un
// precio a mano.
import { useEffect, useMemo, useRef, useState } from "react";
import PageHero from "../../components/layout/PageHero";
import Icono from "../../components/common/Icono";
import { CALENDLY_URL } from "../../config/contacto";
import { TESTIMONIOS } from "../../config/testimonios";
import { navigate } from "../../services/navigate";
import {
  ETAPAS_METODO,
  SESION_DIAGNOSTICO,
  MASTER_INCLUYE,
  LISTAS_MASTER,
  PLANES_AVANZADOS,
  PLANES_VISADO,
  ESTANCIA_ESTUDIOS,
  CITAS_ESPANA,
  GASTOS_EXTERNOS,
  RAZONES_METODO,
  CIFRAS_METODO,
  TODOS_PLANES_MASTER,
  TODAS_VIAS,
  FAQ_METODO,
  eur,
} from "../../config/metodo";

// ─────────────────────────────────────────────────────────────────────────────
// Piezas compartidas
// ─────────────────────────────────────────────────────────────────────────────

const TONOS = {
  primary: "bg-primary text-white",
  sky: "bg-sky text-primary",
  accent: "bg-accent text-white",
  sun: "bg-sun text-primary",
};

function IconBadge({ nombre, tono = "primary", size = "md" }) {
  const dims = size === "lg" ? "w-14 h-14" : "w-11 h-11";
  return (
    <div
      className={`shrink-0 rounded-xl flex items-center justify-center ${dims} ${TONOS[tono] || TONOS.primary}`}
    >
      <Icono nombre={nombre} size={size === "lg" ? 26 : 22} />
    </div>
  );
}

function Eyebrow({ children, className = "" }) {
  return (
    <span
      className={`text-xs font-bold uppercase tracking-[0.18em] text-accent ${className}`}
    >
      {children}
    </span>
  );
}

function Seccion({ id, fondo = "bg-white", children, className = "" }) {
  return (
    <section id={id} className={`py-16 sm:py-20 px-6 ${fondo} ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function TituloSeccion({ eyebrow, titulo, destacado, texto, claro = false }) {
  return (
    <div className="max-w-3xl mb-12">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className={`font-fraunces text-3xl sm:text-4xl font-bold mt-3 leading-tight ${
          claro ? "text-white" : "text-primary"
        }`}
      >
        {titulo}
        {destacado && (
          <>
            {" "}
            <span className="text-accent">{destacado}</span>
          </>
        )}
      </h2>
      {texto && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            claro ? "text-white/70" : "text-neutral-700"
          }`}
        >
          {texto}
        </p>
      )}
    </div>
  );
}

// El CTA de toda la web es el mismo: la sesión diagnóstico en Calendly.
function CTA({ children, variante = "primario", className = "" }) {
  const estilos = {
    primario:
      "bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent/25",
    oscuro: "bg-primary text-white hover:bg-primary-dark",
    claro: "bg-white text-primary hover:bg-secondary",
    contorno: "border-2 border-white/30 bg-white/10 text-white hover:bg-white/20",
  };
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-extrabold transition hover:scale-[1.03] active:scale-95 ${estilos[variante]} ${className}`}
    >
      {children}
    </a>
  );
}

function Interno({ href, children, className = "" }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      className={className}
    >
      {children}
    </a>
  );
}

// Cuenta hasta el valor sin depender de IntersectionObserver: el proyecto ya
// tuvo un sistema de revelado por scroll con ese mecanismo y no fue fiable.
function Numero({ valor, prefijo = "", sufijo = "", duracion = 1400 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const inicio = performance.now();
    function tick(ahora) {
      const p = Math.min((ahora - inicio) / duracion, 1);
      setN(Math.round(valor * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [valor, duracion]);
  return (
    <>
      {prefijo}
      {n}
      {sufijo}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// El riel de marca: Admisión → Carta → Visado → Llegada
// ─────────────────────────────────────────────────────────────────────────────

function RielEtapas({ activa, onElegir }) {
  return (
    <div className="relative">
      {/* Línea que une los cuatro hitos (solo desktop) */}
      <div
        aria-hidden
        className="hidden md:block absolute left-[12.5%] right-[12.5%] top-7 h-px bg-gradient-to-r from-sky/40 via-accent/50 to-sun/60"
      />
      <ol className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
        {ETAPAS_METODO.map((e) => {
          const esActiva = activa === e.id;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onElegir(e.id)}
                aria-pressed={esActiva}
                className="group w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl p-2"
              >
                <span
                  className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                    esActiva
                      ? "border-accent bg-accent text-white scale-110 shadow-lg shadow-accent/30"
                      : "border-white/25 bg-white/10 text-white group-hover:border-accent/60 group-hover:bg-white/20"
                  }`}
                >
                  <Icono nombre={e.icono} size={24} />
                </span>
                <span
                  className={`block font-fraunces text-lg font-bold transition-colors ${
                    esActiva ? "text-accent" : "text-white"
                  }`}
                >
                  {e.hito}
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-widest text-white/45">
                  Etapa {e.n}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulador: "arma tu inversión". Es el corazón de la página — convierte la
// promesa ("inversión distribuida") en un número que el visitante ve moverse.
// ─────────────────────────────────────────────────────────────────────────────

// Los planes del simulador, agrupados por lista para que se lean sin
// ambigüedad (los nombres de plan se repiten entre listas).
const GRUPOS_PLANES = TODOS_PLANES_MASTER.reduce((acc, p) => {
  const grupo = acc.find((g) => g.lista === p.lista);
  if (grupo) grupo.planes.push(p);
  else acc.push({ lista: p.lista, planes: [p] });
  return acc;
}, []);

function Simulador() {
  // Arranca con la configuración del presupuesto tipo que reparte la empresa
  // (Plan Full Económico + Asesoría Integral + las dos citas): así el
  // simulador nunca se ve vacío y el primer número ya es realista.
  const [planId, setPlanId] = useState("l1-full");
  const [viaId, setViaId] = useState("visado-integral");
  const [citas, setCitas] = useState(() => CITAS_ESPANA.map((c) => c.id));

  const plan = TODOS_PLANES_MASTER.find((p) => p.id === planId) || null;
  const via = TODAS_VIAS.find((v) => v.id === viaId) || null;
  const citasElegidas = CITAS_ESPANA.filter((c) => citas.includes(c.id));
  const totalCitas = citasElegidas.reduce((s, c) => s + c.precio, 0);

  const total =
    SESION_DIAGNOSTICO.precio +
    (plan?.precio || 0) +
    (via?.precio || 0) +
    totalCitas;

  const momentos = useMemo(
    () => [
      {
        id: "hoy",
        cuando: "Hoy",
        que: "Sesión diagnóstico",
        detalle: `${SESION_DIAGNOSTICO.duracion} con un abogado`,
        importe: SESION_DIAGNOSTICO.precio,
        icono: "balanza",
        tono: "sky",
      },
      {
        id: "inicio",
        cuando: "Al iniciar el proceso",
        que: "50 % del paquete de máster",
        detalle: plan ? plan.nombre : "Elige tu plan de postulación",
        importe: plan ? plan.precio / 2 : 0,
        icono: "birrete",
        tono: "primary",
      },
      {
        id: "dos-meses",
        cuando: "A los dos meses",
        que: "50 % restante del máster",
        detalle: "Con la postulación ya en marcha",
        importe: plan ? plan.precio / 2 : 0,
        icono: "calendario",
        tono: "primary",
      },
      {
        id: "carta",
        cuando: "Con la carta de admisión",
        que: via ? via.nombre : "Visado o estancia",
        detalle: via ? via.detalle : "Se decide cuando llega la carta",
        importe: via?.precio || 0,
        icono: "pasaporte",
        tono: "accent",
      },
      {
        id: "visa",
        cuando: "Con la visa aprobada",
        que: "Citas en España",
        detalle:
          citasElegidas.length > 0
            ? citasElegidas.map((c) => c.nombre.replace("Cita de ", "")).join(" + ")
            : "Sin citas seleccionadas",
        importe: totalCitas,
        icono: "casa",
        tono: "sun",
      },
    ],
    [plan, via, citasElegidas, totalCitas]
  );

  const maxImporte = Math.max(...momentos.map((m) => m.importe), 1);

  function alternarCita(id) {
    setCitas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,26rem)] gap-8 items-start">
      {/* Controles */}
      <div className="space-y-7">
        {/* Paquete de máster */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-white">
              1
            </span>
            <h3 className="font-fraunces text-lg font-bold text-primary">
              ¿Hasta dónde quieres postular?
            </h3>
          </div>
          <p className="text-sm text-neutral-500 mb-5 pl-10">
            Todos los planes incluyen lo mismo. Solo cambia la cobertura.
          </p>
          {/* Agrupados por lista: los nombres de plan se repiten entre listas
              (hay tres "Plan A"), y sin el grupo delante no se distinguen. */}
          <div className="space-y-5">
            {GRUPOS_PLANES.map((g) => (
              <div key={g.lista}>
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  {g.lista}
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {g.planes.map((p) => {
                    const sel = p.id === planId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlanId(p.id)}
                        className={`text-left rounded-xl border px-4 py-3 transition-all ${
                          sel
                            ? "border-accent bg-accent/[0.07] ring-1 ring-accent"
                            : "border-neutral-200 hover:border-accent/50 hover:bg-accent/[0.03]"
                        }`}
                      >
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-primary">
                            {p.nombre}
                          </span>
                          <span
                            className={`text-sm font-black ${sel ? "text-accent" : "text-neutral-500"}`}
                          >
                            {eur(p.precio)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-neutral-500">
                          {p.alcance}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vía migratoria */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-white">
              2
            </span>
            <h3 className="font-fraunces text-lg font-bold text-primary">
              ¿Cómo vas a entrar a España?
            </h3>
          </div>
          <p className="text-sm text-neutral-500 mb-5 pl-10">
            Esto se decide con la carta de admisión sobre la mesa, no antes.
          </p>
          <div className="grid gap-2.5">
            {TODAS_VIAS.map((v) => {
              const sel = v.id === viaId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setViaId(sel ? null : v.id)}
                  className={`text-left rounded-xl border px-4 py-3 transition-all ${
                    sel
                      ? "border-accent bg-accent/[0.07] ring-1 ring-accent"
                      : "border-neutral-200 hover:border-accent/50 hover:bg-accent/[0.03]"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-bold text-primary">
                      {v.nombre}
                    </span>
                    <span
                      className={`shrink-0 text-sm font-black ${sel ? "text-accent" : "text-neutral-500"}`}
                    >
                      {eur(v.precio)}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-neutral-500">
                    {v.detalle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Citas en España */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[11px] font-black text-white">
              3
            </span>
            <h3 className="font-fraunces text-lg font-bold text-primary">
              ¿Te gestionamos las citas al llegar?
            </h3>
          </div>
          <p className="text-sm text-neutral-500 mb-5 pl-10">
            Se pagan solo cuando la visa ya está aprobada.
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {CITAS_ESPANA.map((c) => {
              const sel = citas.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => alternarCita(c.id)}
                  aria-pressed={sel}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    sel
                      ? "border-accent bg-accent/[0.07] ring-1 ring-accent"
                      : "border-neutral-200 hover:border-accent/50 hover:bg-accent/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[11px] font-black ${
                      sel
                        ? "border-accent bg-accent text-white"
                        : "border-neutral-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-primary">
                      {c.nombre}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-sm font-black ${sel ? "text-accent" : "text-neutral-500"}`}
                  >
                    {eur(c.precio)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resultado: el reparto en el tiempo */}
      <div className="lg:sticky lg:top-24">
        <div className="rounded-3xl bg-primary text-white p-6 sm:p-7 shadow-2xl shadow-primary/25">
          <Eyebrow>Tu inversión, repartida</Eyebrow>
          <p className="mt-3 font-fraunces text-4xl font-bold leading-none">
            {eur(total)}
          </p>
          <p className="mt-2 text-sm text-white/60">
            Honorarios de Inspira, de la primera sesión hasta tu TIE. No incluye
            matrícula, tasas ni seguro.
          </p>

          <ol className="mt-6 space-y-3">
            {momentos.map((m) => (
              <li key={m.id}>
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONOS[m.tono]}`}
                  >
                    <Icono nombre={m.icono} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                        {m.cuando}
                      </span>
                      <span className="shrink-0 text-sm font-black tabular-nums">
                        {m.importe > 0 ? eur(m.importe) : "—"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug">{m.que}</p>
                    <p className="truncate text-xs text-white/50">{m.detalle}</p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                        style={{ width: `${(m.importe / maxImporte) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <CTA variante="primario" className="mt-7 w-full">
            Empezar por la sesión diagnóstico
          </CTA>
          <p className="mt-3 text-center text-xs text-white/45">
            {SESION_DIAGNOSTICO.precioTexto} · {SESION_DIAGNOSTICO.precioAlt}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-neutral-500">
          Importes referenciales de nuestros honorarios. El paquete definitivo
          se cierra por escrito después de la sesión diagnóstico, con tu caso ya
          analizado.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Planes de máster, por listas
// ─────────────────────────────────────────────────────────────────────────────

function PlanesMaster() {
  const [listaId, setListaId] = useState(LISTAS_MASTER[0].id);
  const lista = LISTAS_MASTER.find((l) => l.id === listaId) || LISTAS_MASTER[0];

  return (
    <>
      <div className="grid lg:grid-cols-[minmax(0,20rem)_1fr] gap-8 items-start">
        {/* Qué incluyen todos */}
        <div className="rounded-2xl border border-neutral-200 bg-secondary-light p-6">
          <IconBadge nombre="birrete" tono="primary" />
          <h3 className="mt-4 font-fraunces text-lg font-bold text-primary">
            Todos los planes incluyen lo mismo
          </h3>
          <p className="mt-1.5 text-sm text-neutral-600">
            Lo único que cambia es a cuántas universidades y comunidades
            postulamos por ti.
          </p>
          <ul className="mt-4 space-y-2">
            {MASTER_INCLUYE.map((i) => (
              <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="leading-snug">{i}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {/* Selector de lista */}
          <div className="flex flex-wrap gap-2 mb-6">
            {LISTAS_MASTER.map((l) => {
              const sel = l.id === listaId;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setListaId(l.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    sel
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white border border-neutral-200 text-primary hover:border-primary/40"
                  }`}
                >
                  <span className="mr-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                    {l.etiqueta}
                  </span>
                  {l.nombre}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 mb-5">
            <p className="text-sm font-semibold text-primary">
              {lista.comunidades}
            </p>
            <p className="mt-1 text-sm text-neutral-500">{lista.nota}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {lista.planes.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg ${
                  p.destacado ? "border-accent ring-1 ring-accent/30" : "border-neutral-200"
                }`}
              >
                {p.destacado && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    Cobertura total
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="font-fraunces text-lg font-bold text-primary">
                    {p.nombre}
                  </h4>
                  <span className="shrink-0 font-fraunces text-2xl font-bold text-accent">
                    {eur(p.precio)}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {p.alcance}
                </p>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-neutral-600">
                  {p.detalle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planes avanzados */}
      <div className="mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>Cuando no puedes fallar</Eyebrow>
            <h3 className="mt-2 font-fraunces text-2xl font-bold text-primary">
              Planes avanzados: sin límite de listas
            </h3>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {PLANES_AVANZADOS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <IconBadge nombre={p.icono} tono={p.tono} size="lg" />
                <span className="font-fraunces text-3xl font-bold text-primary">
                  {eur(p.precio)}
                </span>
              </div>
              <h4 className="mt-4 font-fraunces text-xl font-bold text-primary">
                {p.nombre}
              </h4>
              <p className="mt-1 text-sm font-semibold text-accent">{p.resumen}</p>
              <ul className="mt-4 space-y-2">
                {p.alcance.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm text-neutral-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="leading-snug">{a}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl bg-secondary-light p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary/60">
                  Es para ti si
                </p>
                <ul className="mt-2 space-y-1.5">
                  {p.para.map((t) => (
                    <li key={t} className="text-sm leading-snug text-neutral-700">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Ninguno de los planes incluye las tasas de postulación ni las de
        documentos, que se pagan directamente a cada universidad u organismo.
        No garantizamos la admisión: la decide la universidad.
      </p>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

function Faq() {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="grid gap-3 max-w-3xl">
      {FAQ_METODO.map((f, i) => {
        const open = abierta === i;
        return (
          <div
            key={f.q}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          >
            <button
              type="button"
              onClick={() => setAbierta(open ? -1 : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-primary">{f.q}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-light text-primary transition-transform ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {open && (
              <div className="px-5 pb-5 text-sm leading-relaxed text-neutral-600">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Página
// ─────────────────────────────────────────────────────────────────────────────

export default function MetodoInspira() {
  const [etapaActiva, setEtapaActiva] = useState("admision");
  const simuladorRef = useRef(null);

  const etapa =
    ETAPAS_METODO.find((e) => e.id === etapaActiva) || ETAPAS_METODO[0];

  function irAlSimulador() {
    simuladorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="w-full bg-white">
      <style>{`
        @keyframes metodoSube { from { transform: translateY(18px); } to { transform: translateY(0); } }
      `}</style>

      <PageHero
        etiqueta="Método Inspira"
        icono="brujula"
        titulo="Tu proceso,"
        destacado="por etapas."
        descripcion="Una inversión distribuida, porque sabemos que tu proyecto empieza mucho antes de llegar a España. Cada etapa se paga cuando la anterior ya dio resultado."
        accesos={[
          { icono: "euro", label: "Encuentra tu máster gratis", href: "/calculadora-master" },
          { icono: "birrete", label: "Paquetes de máster", href: "/servicios/master" },
          { icono: "brujula", label: "Todos los servicios", href: "/servicios" },
        ]}
      >
        <CTA variante="primario">
          Reservar mi sesión diagnóstico · {SESION_DIAGNOSTICO.precioTexto}
        </CTA>
        <button
          type="button"
          onClick={irAlSimulador}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white transition hover:bg-white/20"
        >
          Calcular mi inversión
        </button>
      </PageHero>

      {/* ── El riel: Admisión → Carta → Visado → Llegada ──────────────────── */}
      <section className="relative overflow-hidden bg-primary px-6 py-14 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent opacity-[0.13] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-sky opacity-[0.12] blur-2xl"
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm font-bold uppercase tracking-[0.3em] text-white/40">
            Admisión · Carta · Visado · Llegada
          </p>

          <RielEtapas activa={etapaActiva} onElegir={setEtapaActiva} />

          {/* Detalle de la etapa elegida */}
          <div
            key={etapa.id}
            className="mt-10 animate-[metodoSube_0.4s_ease-out_both] rounded-3xl bg-white/[0.06] p-6 backdrop-blur sm:p-8 ring-1 ring-white/10"
          >
            <div className="grid gap-7 md:grid-cols-[1fr_minmax(0,18rem)]">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-accent">
                  Etapa {etapa.n} · {etapa.hito}
                </span>
                <h3 className="mt-2 font-fraunces text-2xl font-bold text-white sm:text-3xl">
                  {etapa.titulo}
                </h3>
                <p className="mt-3 leading-relaxed text-white/70">
                  {etapa.resumen}
                </p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {etapa.entregables.map((e) => (
                    <li key={e} className="flex gap-2.5 text-sm text-white/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="leading-snug">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Cuándo pagas
                  </p>
                  <p className="mt-1.5 font-semibold text-white">{etapa.pagas}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Cuánto dura
                  </p>
                  <p className="mt-1.5 font-semibold text-white">
                    {etapa.duracion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cifras */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {CIFRAS_METODO.map((c) => (
              <div key={c.etiqueta} className="text-center">
                <p className="font-fraunces text-3xl font-bold text-accent sm:text-4xl">
                  <Numero
                    valor={c.valor}
                    prefijo={c.prefijo || ""}
                    sufijo={c.sufijo || ""}
                  />
                </p>
                <p className="mt-1 text-xs leading-snug text-white/50">
                  {c.etiqueta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Punto de partida: la sesión diagnóstico ───────────────────────── */}
      <Seccion fondo="bg-secondary-light">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Antes de la etapa 01</Eyebrow>
            <h2 className="mt-3 font-fraunces text-3xl font-bold leading-tight text-primary sm:text-4xl">
              Todo empieza con{" "}
              <span className="text-accent">una sesión diagnóstico</span>, no con
              un paquete.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-700">
              {SESION_DIAGNOSTICO.gancho} Es el único servicio que se contrata
              sin conocer tu caso — y existe precisamente para conocerlo.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <CTA variante="primario">Reservar 30 minutos</CTA>
              <Interno
                href="/calculadora-master"
                className="text-sm font-bold text-primary underline underline-offset-4 hover:text-accent"
              >
                Antes, encuentra tu máster gratis →
              </Interno>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <IconBadge nombre={SESION_DIAGNOSTICO.icono} tono="primary" size="lg" />
              <div className="text-right">
                <p className="font-fraunces text-4xl font-bold text-primary">
                  {SESION_DIAGNOSTICO.precioTexto}
                </p>
                <p className="text-xs text-neutral-400">
                  {SESION_DIAGNOSTICO.precioAlt}
                </p>
              </div>
            </div>
            <h3 className="mt-5 font-fraunces text-xl font-bold text-primary">
              {SESION_DIAGNOSTICO.nombre}
            </h3>
            <p className="text-sm text-neutral-500">
              {SESION_DIAGNOSTICO.duracion} · reunión online
            </p>
            <ul className="mt-5 space-y-2.5">
              {SESION_DIAGNOSTICO.incluye.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-neutral-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-black text-accent">
                    ✓
                  </span>
                  <span className="leading-snug">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Seccion>

      {/* ── Simulador ─────────────────────────────────────────────────────── */}
      <div ref={simuladorRef} className="scroll-mt-20">
        <Seccion id="simulador" fondo="bg-neutral-50">
          <TituloSeccion
            eyebrow="Arma tu propuesta"
            titulo="Mira cómo se reparte"
            destacado="tu inversión"
            texto="Elige hasta dónde quieres postular, cómo vas a entrar a España y si quieres que te gestionemos las citas al llegar. El total se reparte solo, en el orden en que ocurren las cosas."
          />
          <Simulador />
        </Seccion>
      </div>

      {/* ── Etapa 01: paquetes de máster ──────────────────────────────────── */}
      <Seccion fondo="bg-white">
        <TituloSeccion
          eyebrow="Etapa 01 · Admisión"
          titulo="Paquete Máster:"
          destacado="tú eliges la cobertura"
          texto="Postular a una universidad andaluza no cuesta lo mismo que postular a las diecisiete comunidades. Por eso el paquete no es único: eliges cuánta red quieres echar."
        />
        <PlanesMaster />
        <div className="mt-10 rounded-2xl border border-neutral-200 bg-secondary-light p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-fraunces text-lg font-bold text-primary">
              ¿Todavía no sabes qué máster quieres?
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Usa la calculadora: encuentra tu máster a tu medida, gratis y al
              instante.
            </p>
          </div>
          <Interno
            href="/calculadora-master"
            className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-extrabold text-white transition hover:bg-primary-dark sm:mt-0"
          >
            <Icono nombre="euro" size={18} />
            Encontrar mi máster
          </Interno>
        </div>
      </Seccion>

      {/* ── Etapa 03: vías migratorias ────────────────────────────────────── */}
      <Seccion fondo="bg-secondary-light">
        <TituloSeccion
          eyebrow="Etapa 03 · Visado"
          titulo="Dos caminos legales"
          destacado="al mismo permiso"
          texto="El visado se pide en el consulado de tu país; la estancia por estudios, ya estando en España. Cuál te toca no lo decides por presupuesto: lo decide dónde estás y qué plazos te corren."
        />

        <div className="mb-4 flex items-center gap-3">
          <IconBadge nombre="pasaporte" tono="primary" />
          <div>
            <h3 className="font-fraunces text-xl font-bold text-primary">
              Visa de estudios · desde tu país
            </h3>
            <p className="text-sm text-neutral-500">
              Tres niveles de acompañamiento, según cuánto quieras llevar tú.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANES_VISADO.map((p) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                p.destacado
                  ? "border-accent ring-2 ring-accent/25 md:-mt-2 md:mb-2"
                  : "border-neutral-200"
              }`}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  El que recomendamos
                </span>
              )}
              <IconBadge nombre={p.icono} tono={p.tono} />
              <h4 className="mt-4 font-fraunces text-xl font-bold text-primary">
                {p.nombre}
              </h4>
              <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                {p.subtitulo}
              </p>
              <p className="mt-4 font-fraunces text-3xl font-bold text-accent">
                {eur(p.precio)}
              </p>
              <ul className="mt-5 flex-1 space-y-2">
                {p.incluye.map((i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="leading-snug">{i}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-neutral-200 pt-4 text-sm italic leading-snug text-neutral-500">
                {p.para}
              </p>
            </div>
          ))}
        </div>

        {/* Estancia por estudios */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-primary text-white">
          <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_minmax(0,20rem)]">
            <div>
              <div className="flex items-center gap-3">
                <IconBadge nombre={ESTANCIA_ESTUDIOS.icono} tono="accent" />
                <div>
                  <h3 className="font-fraunces text-xl font-bold text-white sm:text-2xl">
                    {ESTANCIA_ESTUDIOS.nombre}
                  </h3>
                  <p className="text-sm text-white/55">
                    {ESTANCIA_ESTUDIOS.subtitulo}
                  </p>
                </div>
              </div>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {ESTANCIA_ESTUDIOS.incluye.map((i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-white/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="leading-snug">{i}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sun/20 px-4 py-2 text-sm font-bold text-sun">
                <Icono nombre="maletin" size={16} />
                {ESTANCIA_ESTUDIOS.permiso}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
              <p className="font-fraunces text-4xl font-bold">
                {eur(ESTANCIA_ESTUDIOS.precio)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
                Inversión total
              </p>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Es tu vía si
              </p>
              <ul className="mt-2 space-y-2">
                {ESTANCIA_ESTUDIOS.para.map((t) => (
                  <li key={t} className="text-sm leading-snug text-white/75">
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                No incluye
              </p>
              <ul className="mt-2 space-y-1.5">
                {ESTANCIA_ESTUDIOS.noIncluye.map((t) => (
                  <li key={t} className="text-xs leading-snug text-white/50">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Seccion>

      {/* ── Etapa 04: citas en España ─────────────────────────────────────── */}
      <Seccion fondo="bg-white">
        <TituloSeccion
          eyebrow="Etapa 04 · Llegada"
          titulo="Aterrizar también"
          destacado="es un trámite"
          texto="El visado te deja entrar; el empadronamiento y la TIE te dejan quedarte. Son citas cortas, baratas y con muy poca disponibilidad: el error habitual es dejarlas para después."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {CITAS_ESPANA.map((c) => (
            <div
              key={c.id}
              className="flex gap-5 rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <IconBadge nombre={c.icono} tono="sun" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-fraunces text-lg font-bold text-primary">
                    {c.nombre}
                  </h3>
                  <span className="shrink-0 font-fraunces text-2xl font-bold text-accent">
                    {eur(c.precio)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {c.detalle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Seccion>

      {/* ── Lo que no cobramos nosotros ───────────────────────────────────── */}
      <Seccion fondo="bg-neutral-50">
        <TituloSeccion
          eyebrow="Transparencia"
          titulo="Lo que no cobramos"
          destacado="nosotros"
          texto="Contarte solo nuestros honorarios sería contarte la mitad. Estos importes son referenciales, van directos a universidades y organismos, y conviene tenerlos en el presupuesto desde el primer día."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GASTOS_EXTERNOS.map((g) => (
            <div
              key={g.nombre}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <IconBadge nombre={g.icono} tono="sky" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-primary">
                    {g.nombre}
                  </p>
                  <p className="font-fraunces text-lg font-bold text-accent">
                    {g.importe}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                {g.nota}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm font-bold text-primary">Importante</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-600">
            <li>
              Los precios son referenciales y pueden variar según la
              universidad, la ciudad y el tipo de trámite.
            </li>
            <li>
              Los gastos relacionados con el proceso no están incluidos en los
              servicios de Inspira.
            </li>
            <li>
              No incluye pasajes aéreos, manutención ni otros gastos personales.
            </li>
          </ul>
        </div>
      </Seccion>

      {/* ── Por qué el método aguanta ─────────────────────────────────────── */}
      <Seccion fondo="bg-white">
        <TituloSeccion
          eyebrow="Por qué funciona"
          titulo="El método no es un calendario:"
          destacado="es una forma de responder"
          texto="Cobrar por etapas solo tiene sentido si cada etapa se entrega. Esto es lo que sostiene la promesa."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {RAZONES_METODO.map((r) => (
            <div
              key={r.titulo}
              className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <IconBadge nombre={r.icono} tono="primary" />
              <div>
                <h3 className="font-bold text-primary">{r.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {r.texto}
                </p>
              </div>
            </div>
          ))}
        </div>

        {TESTIMONIOS.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {TESTIMONIOS.map((t) => (
              <figure
                key={t.nombre}
                className="rounded-2xl border border-neutral-200 bg-secondary-light p-6"
              >
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: t.estrellas }).map((_, i) => (
                    <Icono key={i} nombre="estrella" size={16} />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-neutral-700">
                  “{t.texto}”
                </blockquote>
                <figcaption className="mt-4 text-xs text-neutral-500">
                  <span className="font-bold text-primary">{t.nombre}</span> ·{" "}
                  {t.servicio} · {t.fuente}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Seccion>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <Seccion fondo="bg-secondary-light">
        <TituloSeccion
          eyebrow="Preguntas"
          titulo="Lo que siempre"
          destacado="nos preguntan"
        />
        <Faq />
      </Seccion>

      {/* ── Cierre ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary px-6 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-sky opacity-[0.12] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent opacity-[0.14] blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow>Método Inspira</Eyebrow>
          <h2 className="mt-4 font-fraunces text-3xl font-bold leading-tight text-white sm:text-5xl">
            Tu proyecto empieza mucho antes
            <br />
            de llegar a <span className="text-accent">España.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            Empieza por los 30 minutos que ordenan todo lo demás. Salimos de ahí
            con tu vía definida, tus plazos claros y tu propuesta por escrito.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CTA variante="primario">
              Reservar mi sesión diagnóstico · {SESION_DIAGNOSTICO.precioTexto}
            </CTA>
            <Interno
              href="/servicios/master"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white transition hover:bg-white/20"
            >
              Ver paquetes de máster
            </Interno>
          </div>
          <p className="mt-6 text-sm text-white/45">
            Sueña · Aprende · Viaja
          </p>
        </div>
      </section>

    </main>
  );
}
