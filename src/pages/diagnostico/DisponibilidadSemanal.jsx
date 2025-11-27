import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

const hoyISO = new Date().toISOString().slice(0, 10);

function formatoFechaLarga(fechaISO) {
  const f = new Date(fechaISO);
  return f.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}

export default function DisponibilidadSemanal() {
  const [baseFecha, setBaseFecha] = useState(hoyISO);
  const [semana, setSemana] = useState([]);
  const [loading, setLoading] = useState(false);

  const diasSemana = 7;

  function getFechasSemana(fechaBase) {
    const d = new Date(fechaBase);
    const arr = [];
    for (let i = 0; i < diasSemana; i++) {
      const copia = new Date(d);
      copia.setDate(copia.getDate() + i);
      arr.push(copia.toISOString().slice(0, 10));
    }
    return arr;
  }

  async function cargarSemana() {
    setLoading(true);
    const fechas = getFechasSemana(baseFecha);

    const resultados = await Promise.all(
      fechas.map(async (fecha) => {
        const r = await apiGET(`/diagnostico/disponibilidad?fecha=${fecha}`);
        return { fecha, bloques: r.ok ? r.bloques : [] };
      })
    );

    setSemana(resultados);
    setLoading(false);
  }

  useEffect(() => {
    cargarSemana();
  }, [baseFecha]);

  function cambiarSemana(direccion) {
    const d = new Date(baseFecha);
    d.setDate(d.getDate() + direccion * 7);
    setBaseFecha(d.toISOString().slice(0, 10));
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-[#023A4B] mb-4">
        Elige fecha y horario
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => cambiarSemana(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Semana anterior
        </button>

        <button
          onClick={cargarSemana}
          className="px-4 py-2 bg-[#023A4B] text-white rounded-md hover:bg-[#035066]"
        >
          Recargar
        </button>

        <button
          onClick={() => cambiarSemana(1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Semana siguiente
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-500">Cargando...</div>
      )}

      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3">
        {semana.map((dia) => (
          <div key={dia.fecha} className="border rounded-lg p-4 bg-white">
            <h2 className="text-xl font-semibold text-[#023A4B] mb-3">
              {formatoFechaLarga(dia.fecha)}
            </h2>

            {dia.bloques.length === 0 && (
              <p className="text-gray-500 italic">Sin turnos disponibles</p>
            )}

            <div className="space-y-3">
              {dia.bloques.map((b) => (
                <div
                  key={b.id_bloque}
                  className="flex items-center justify-between border rounded-md px-4 py-3"
                >
                  <span className="text-lg">
                    {b.hora_inicio} – {b.hora_fin}
                  </span>
                  <button
                    onClick={() => alert("Reservar " + b.id_bloque)}
                    className="px-4 py-2 bg-[#023A4B] text-white rounded-md hover:bg-[#035066]"
                  >
                    Reservar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <a
          href="/diagnostico"
          className="inline-block px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Volver
        </a>
      </div>
    </div>
  );
}
