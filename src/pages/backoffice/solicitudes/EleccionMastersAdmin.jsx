// src/pages/backoffice/solicitudes/EleccionMastersAdmin.jsx
// Bloque 5 — Elección de másteres del cliente + control de plan Sí/No por parte del asesor.
import { useState } from "react";
import { boPATCH } from "../../../services/backofficeApi";

const COLORES_PRIORIDAD = ["bg-[#1A3557]", "bg-[#1D6A4A]", "bg-amber-500", "bg-neutral-400", "bg-neutral-300"];

export default function EleccionMastersAdmin({ elecciones, idSolicitud, onEleccionesActualizadas }) {
  const [filas, setFilas]         = useState(() => normalizar(elecciones));
  const [guardando, setGuardando] = useState(false);
  const [nota, setNota]           = useState(() => extraerNota(elecciones));

  function normalizar(raw) {
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return [...raw]
      .sort((a, b) => (a.prioridad || 0) - (b.prioridad || 0))
      .map((f) => ({ ...f, plan_incluido: f.plan_incluido ?? true }));
  }

  function extraerNota(raw) {
    if (!Array.isArray(raw) || raw.length === 0) return "";
    // La nota global se guarda en el primer elemento con key _nota_asesor
    return raw[0]?._nota_asesor ?? "";
  }

  async function togglePlan(idx) {
    const nuevas = filas.map((f, i) =>
      i === idx ? { ...f, plan_incluido: !f.plan_incluido } : f
    );
    setFilas(nuevas);
    await guardar(nuevas, nota);
  }

  async function guardarNota(textoNota) {
    setNota(textoNota);
    await guardar(filas, textoNota);
  }

  async function guardar(filasActuales, notaActual) {
    if (!idSolicitud) return;
    setGuardando(true);
    try {
      const payload = filasActuales.map((f, idx) => ({
        ...f,
        ...(idx === 0 ? { _nota_asesor: notaActual } : {}),
      }));
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/eleccion-plan`, {
        eleccion_masters: payload,
      });
      if (r.ok && onEleccionesActualizadas) {
        onEleccionesActualizadas(r.eleccion_masters);
      }
    } catch (e) {
      console.error("Error guardando elección:", e);
    } finally {
      setGuardando(false);
    }
  }

  if (filas.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        El cliente aún no ha registrado másteres preferidos en este bloque.
      </p>
    );
  }

  const nSi = filas.filter((f) => f.plan_incluido).length;
  const nNo = filas.filter((f) => !f.plan_incluido).length;

  return (
    <div className="space-y-3">
      {/* Banner plan */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm"
        style={{ background: "linear-gradient(135deg, #1D6A4A, #1A3557)" }}
      >
        <span className="text-base shrink-0">🎯</span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[13px] font-bold">Selección del cliente</p>
          <p className="text-[11px] text-white/70">
            El cliente eligió libremente. Tú decides cuáles entran en el plan contratado.
          </p>
        </div>
        {guardando && (
          <span className="text-[10px] text-white/60 font-mono shrink-0">Guardando…</span>
        )}
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-0.5">Elegidos</p>
          <p className="font-serif text-lg font-bold text-[#1A3557]">{filas.length}</p>
        </div>
        <div className="bg-[#E8F5EE] border border-[#1D6A4A]/20 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] font-mono mb-0.5">En plan</p>
          <p className="font-serif text-lg font-bold text-[#1D6A4A]">{nSi}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl py-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 font-mono mb-0.5">Coordinar</p>
          <p className="font-serif text-lg font-bold text-amber-600">{nNo}</p>
        </div>
      </div>

      {/* Filas de másteres */}
      <div className="space-y-2">
        {filas.map((fila, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
              ${fila.plan_incluido
                ? "border-[#1D6A4A]/25 bg-[#E8F5EE]"
                : "border-amber-200 bg-amber-50"}`}
          >
            {/* Número de prioridad */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 font-mono ${COLORES_PRIORIDAD[idx] ?? "bg-neutral-400"}`}>
              P{fila.prioridad ?? idx + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#1A3557] leading-snug truncate">
                {fila.programa || "(Sin título)"}
              </p>
              {(fila.comentario || fila.universidad || fila.precio) && (
                <p className="text-[11px] text-neutral-500 truncate">
                  {[fila.universidad, fila.precio ? `${fila.precio} €/año` : null, fila.comentario]
                    .filter(Boolean).join(" · ")}
                </p>
              )}
            </div>

            {/* Toggle plan Sí/No */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-neutral-500 hidden sm:block">Plan:</span>
              <button
                type="button"
                onClick={() => togglePlan(idx)}
                disabled={guardando}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-[1.5px] transition-all
                  ${fila.plan_incluido
                    ? "bg-[#1D6A4A] border-[#1D6A4A] text-white"
                    : "bg-white border-neutral-300 text-neutral-400 hover:border-[#1D6A4A] hover:text-[#1D6A4A]"}`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => togglePlan(idx)}
                disabled={guardando}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-[1.5px] transition-all
                  ${!fila.plan_incluido
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-neutral-300 text-neutral-400 hover:border-amber-500 hover:text-amber-600"}`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="flex gap-4 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1D6A4A]" />
          <strong className="font-serif text-base text-[#1D6A4A]">{nSi}</strong>
          <span className="text-neutral-500">incluidos en plan</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <strong className="font-serif text-base text-amber-600">{nNo}</strong>
          <span className="text-neutral-500">fuera del plan — coordinar</span>
        </span>
      </div>

      {/* Nota para el cliente */}
      <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 font-mono mb-2">
          ✎ Nota para enviar al cliente
        </p>
        <textarea
          rows={3}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={(e) => guardarNota(e.target.value)}
          placeholder="Ej: Claudia, hemos revisado tu selección. Los primeros 3 másteres están dentro de tu Plan Comfort y comenzamos esta semana..."
          className="w-full text-xs border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 placeholder:text-neutral-300 outline-none focus:border-amber-400 resize-none transition leading-relaxed"
        />
      </div>
    </div>
  );
}
