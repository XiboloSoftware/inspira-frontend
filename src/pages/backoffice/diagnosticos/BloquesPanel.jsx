// src/pages/backoffice/diagnosticos/BloquesPanel.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boDELETE } from "../../../services/backofficeApi";
import BloqueRow from "./BloqueRow";
import { getEstadoTurnoClave } from "./components/bloqueEstadoUtils";

import BloquesHeader from "./components/BloquesHeader";
import BloquesFiltroEstado from "./components/BloquesFiltroEstado";

// Fecha local YYYY-MM-DD (sin UTC)
function hoyLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const hoyISO = hoyLocalISO();


// suma días a un YYYY-MM-DD sin pelearse con la zona horaria
function addDays(fechaStr, offset) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const base = new Date(y, m - 1, d + offset);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// 2025-11-27 -> "27 de noviembre"
function formatFechaLarga(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}

// ¿la hora_inicio de este bloque aún no ha ocurrido?
function esBloqueFuturo(fechaStr, bloque) {
  if (!bloque.hora_inicio) return true;
  const [y, m, d] = fechaStr.split("-").map(Number);
  const [hh, mm] = bloque.hora_inicio.split(":").map(Number);
  const inicio = new Date(y, m - 1, d, hh, mm || 0, 0, 0);
  const ahora = new Date();
  return inicio >= ahora;
}

export default function BloquesPanel({ user }) {
  // esta fecha sirve como "Semana desde" y también para crear / eliminar bloques
  const [fecha, setFecha] = useState(hoyISO);
  const [diasSemana, setDiasSemana] = useState([]); // [{ fecha, bloques: [] }]
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("13:00");

  const [asesores, setAsesores] = useState([]);

  // Carga los turnos de 7 días a partir de "fecha"
  async function cargar() {
    if (!fecha) return;
    setLoading(true);
    try {
      const dias = [];
      for (let i = 0; i < 7; i++) {
        const f = addDays(fecha, i);
        const r = await boGET(`/backoffice/diagnosticos/bloques?fecha=${f}`);
        if (r.ok) {
          dias.push({ fecha: f, bloques: r.bloques || [] });
        } else {
          console.error(r);
          dias.push({ fecha: f, bloques: [] });
        }
      }
      setDiasSemana(dias);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function cargarAsesores() {
    try {
      const r = await boGET("/backoffice/usuarios");
      if (r.ok) {
        setAsesores(
          (r.usuarios || []).filter((u) => u.rol === "asesor" && u.activo)
        );
      } else {
        console.error(r);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    cargar();
  }, [fecha]);

  useEffect(() => {
    cargarAsesores();
  }, []);

  async function crearBloques() {
    if (!fecha) return alert("Selecciona una fecha");
    if (!horaInicio || !horaFin) return alert("Completa hora inicio y fin");

    const r = await boPOST("/backoffice/diagnosticos/bloques", {
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
    });
    if (!r.ok) return alert(r.msg || "Error al crear bloques");
    alert("Bloques creados");
    cargar();
  }

  async function eliminarLibres() {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar TODOS los turnos libres de este día?"
    );
    if (!confirmar) return;

    const r = await boDELETE(
      `/backoffice/diagnosticos/bloques?fecha=${fecha}&soloLibres=1`
    );
    if (!r.ok) return alert(r.msg || "Error al eliminar bloques");
    alert(`Eliminados: ${r.deleted}`);
    cargar();
  }

  return (
    <div className="space-y-4">
      <BloquesHeader
        fecha={fecha}
        setFecha={setFecha}
        horaInicio={horaInicio}
        setHoraInicio={setHoraInicio}
        horaFin={horaFin}
        setHoraFin={setHoraFin}
        crearBloques={crearBloques}
        eliminarLibres={eliminarLibres}
      />

      <BloquesFiltroEstado filtro={filtroEstado} setFiltro={setFiltroEstado} />

      <div className="max-h-[60vh] overflow-y-auto pr-1">
        {loading && <div>Cargando...</div>}

        {!loading &&
          diasSemana.map((dia) => {
            const bloquesDia = dia.bloques || [];

            const visibles = bloquesDia.filter((b) => {
              const est = getEstadoTurnoClave(b);
              const pasaEstado =
                filtroEstado === "todos" || est === filtroEstado;
              const esFuturo = esBloqueFuturo(dia.fecha, b);
              // solo mostramos bloques cuya hora_inicio aún no ocurre
              return pasaEstado && esFuturo;
            });

            return (
              <div
                key={dia.fecha}
                className="bg-white border border-neutral-200 rounded-2xl p-4 mb-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold text-primary">
                    {formatFechaLarga(dia.fecha)}
                  </div>
                </div>

                {visibles.length === 0 ? (
                  <div className="text-neutral-500 text-sm">
                    Sin turnos disponibles.
                  </div>
                ) : (
                  visibles.map((b) => (
                    <BloqueRow
                      key={b.id_bloque}
                      b={b}
                      onUpdated={cargar}
                      asesores={asesores}
                      user={user}
                    />
                  ))
                )}
              </div>
            );
          })}

        {!loading && diasSemana.length === 0 && (
          <div className="text-neutral-500">No hay turnos configurados.</div>
        )}
      </div>
    </div>
  );
}
