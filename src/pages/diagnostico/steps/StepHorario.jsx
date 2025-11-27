// src/pages/diagnostico/steps/StepHorario.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";

// Fecha local YYYY-MM-DD
function hoyLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const HOY = hoyLocalISO();
const DIAS_SEMANA = 7;

function formatoFechaLarga(fechaISO) {
  // fechaISO = "YYYY-MM-DD"
  const [y, m, d] = fechaISO.split("-").map(Number);
  const f = new Date(y, m - 1, d); // fecha LOCAL, no UTC

  return f.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}


function getFechasSemana(fechaBase) {
  const d = new Date(fechaBase);
  const arr = [];
  for (let i = 0; i < DIAS_SEMANA; i++) {
    const copia = new Date(d);
    copia.setDate(copia.getDate() + i);
    arr.push(copia.toISOString().slice(0, 10));
  }
  return arr;
}

export default function StepHorario({ onSelectBloque, onBack }) {
  // fecha base de la semana
  const [baseFecha, setBaseFecha] = useState(HOY);
  // [{ fecha, bloques }]
  const [semana, setSemana] = useState([]);
  const [loading, setLoading] = useState(false);

  async function cargarSemana() {
    setLoading(true);
    try {
      const fechas = getFechasSemana(baseFecha);

      const resultados = await Promise.all(
        fechas.map(async (fecha) => {
          const r = await apiGET(`/diagnostico/disponibilidad?fecha=${fecha}`);
          return {
            fecha,
            bloques: r.ok ? r.bloques || [] : [],
          };
        })
      );

      setSemana(resultados);
    } catch (e) {
      console.error(e);
      setSemana([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarSemana();
  }, [baseFecha]);

  function cambiarSemana(direccion) {
    const d = new Date(baseFecha);
    d.setDate(d.getDate() + direccion * 7);
    const nueva = d.toISOString().slice(0, 10);
    setBaseFecha(nueva < HOY ? HOY : nueva); // no ir al pasado
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Elige fecha y horario
      </h1>

      {/* Controles superiores */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-neutral-700">
            Semana desde
          </label>
          <input
            type="date"
            value={baseFecha}
            min={HOY}
            onChange={(e) => setBaseFecha(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cambiarSemana(-1)}
            className="px-4 py-2 text-sm rounded-md border border-neutral-300 hover:bg-neutral-100 transition"
          >
            Semana anterior
          </button>
          <button
            type="button"
            onClick={() => setBaseFecha(HOY)}
            className="px-4 py-2 text-sm rounded-md border border-neutral-300 hover:bg-neutral-100 transition"
          >
            Ir a hoy
          </button>
          <button
            type="button"
            onClick={() => cambiarSemana(1)}
            className="px-4 py-2 text-sm rounded-md border border-neutral-300 hover:bg-neutral-100 transition"
          >
            Semana siguiente
          </button>
        </div>

        <button
          type="button"
          onClick={cargarSemana}
          className="ml-auto px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-light transition"
        >
          Actualizar
        </button>
      </div>

      {loading && <p className="text-neutral-500 mb-4">Cargando horarios...</p>}

      {/* Vista semanal con scroll */}
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {semana.map((dia) => {
          const bloquesVisibles = (dia.bloques || []).filter(
            (b) => !b.estado || b.estado === "libre"
          );

          return (
            <div
              key={dia.fecha}
              className="border border-neutral-200 rounded-xl bg-white shadow-sm p-4"
            >
              <h2 className="text-xl font-semibold text-primary mb-3">
                {formatoFechaLarga(dia.fecha)}
              </h2>

              {!loading && bloquesVisibles.length === 0 && (
                <p className="text-neutral-500 italic">
                  Sin turnos disponibles
                </p>
              )}

              {bloquesVisibles.length > 0 && (
                <div className="space-y-3">
                  {bloquesVisibles.map((b) => (
                    <div
                      key={b.id_bloque}
                      className="flex items-center justify-between border rounded-xl px-4 py-3"
                    >
                      <div className="font-semibold text-neutral-900">
                        {b.hora_inicio} – {b.hora_fin}
                      </div>
                      <button
                        onClick={() => onSelectBloque(b)}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition"
                      >
                        Reservar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm rounded-md border border-neutral-300 text-primary hover:bg-neutral-100 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
