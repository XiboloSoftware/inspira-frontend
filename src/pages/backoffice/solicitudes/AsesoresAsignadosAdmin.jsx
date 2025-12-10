// src/pages/backoffice/solicitudes/AsesoresAsignadosAdmin.jsx
import { useMemo, useState } from "react";

export default function AsesoresAsignadosAdmin({
  asesoresDisponibles,
  asesoresSeleccionados,      // array de IDs (string)
  onChangeSeleccionados,      // (newIds: string[]) => void
  onGuardar,
  guardando,
}) {
  const [filtro, setFiltro] = useState("");
  const [idAAgregar, setIdAAgregar] = useState("");

  // asesores ya asignados
  const asignados = useMemo(
    () =>
      asesoresDisponibles.filter((u) =>
        asesoresSeleccionados.includes(String(u.id_usuario))
      ),
    [asesoresDisponibles, asesoresSeleccionados]
  );

  // asesores NO asignados + filtrados por texto
  const noAsignadosFiltrados = useMemo(() => {
    const base = asesoresDisponibles.filter(
      (u) => !asesoresSeleccionados.includes(String(u.id_usuario))
    );
    if (!filtro.trim()) return base;
    const q = filtro.toLowerCase();
    return base.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [asesoresDisponibles, asesoresSeleccionados, filtro]);

  function handleQuitar(idUsuario) {
    const idStr = String(idUsuario);
    const nuevo = asesoresSeleccionados.filter((x) => x !== idStr);
    onChangeSeleccionados(nuevo);
  }

  function handleSelectAgregar(e) {
    setIdAAgregar(e.target.value);
  }

  function handleAgregar() {
    if (!idAAgregar) return;
    const idStr = String(idAAgregar);
    if (asesoresSeleccionados.includes(idStr)) return;
    onChangeSeleccionados([...asesoresSeleccionados, idStr]);
    setIdAAgregar("");
  }

  return (
    <div className="mt-3 border border-neutral-200 rounded-md p-2">
      <p className="text-xs font-semibold text-neutral-700 mb-1">
        Asesores asignados
      </p>
      <p className="text-[11px] text-neutral-500 mb-2">
        Aquí ves quiénes están asignados a esta solicitud y puedes añadir o quitar asesores.
      </p>

      {/* Lista de asesores actualmente asignados */}
      <div className="mb-3">
        <p className="text-[11px] font-medium text-neutral-700 mb-1">
          Actualmente asignados
        </p>
        {asignados.length === 0 && (
          <p className="text-[11px] text-neutral-400">
            No hay asesores asignados todavía.
          </p>
        )}
        {asignados.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {asignados.map((u) => (
              <span
                key={u.id_usuario}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-neutral-300 bg-neutral-50"
              >
                {u.nombre} ({u.email})
                <button
                  type="button"
                  onClick={() => handleQuitar(u.id_usuario)}
                  className="text-[10px] px-1 rounded-full border border-neutral-300 hover:bg-neutral-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Buscador y selector para añadir nuevos asesores */}
      <div className="mb-2">
        <p className="text-[11px] font-medium text-neutral-700 mb-1">
          Añadir asesor
        </p>

        <input
          type="text"
          className="w-full text-xs border border-neutral-300 rounded-md px-2 py-1 mb-2"
          placeholder="Escribe para filtrar por nombre o email…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <div className="flex gap-2 items-center">
          <select
            className="flex-1 text-xs border border-neutral-300 rounded-md px-2 py-1"
            value={idAAgregar}
            onChange={handleSelectAgregar}
          >
            <option value="">Selecciona un asesor para añadir…</option>
            {noAsignadosFiltrados.map((u) => (
              <option key={u.id_usuario} value={String(u.id_usuario)}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAgregar}
            className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={onGuardar}
          disabled={guardando}
          className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar asesores"}
        </button>
      </div>
    </div>
  );
}
