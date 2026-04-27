// src/pages/backoffice/clientes/ClientesTable.jsx
import { useMemo, useState } from "react";

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 ${i > 0 ? "border-l border-neutral-200" : ""} ${
            value === opt.value ? opt.activeClass : "bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ClienteRow({ c, isAdmin, onEditar, onVerServicios, onToggleActivo }) {
  return (
    <tr className="border-b last:border-0 hover:bg-neutral-50">
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <span>{c.nombre || "—"}</span>
          {!c.activo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">Inactivo</span>}
        </div>
      </td>
      <td className="py-2 px-3">{c.email_contacto}</td>
      <td className="py-2 px-3">{c.telefono || "—"}</td>
      <td className="py-2 px-3">{c.dni || "—"}</td>
      <td className="py-2 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.tiene_servicio ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
          {c.tiene_servicio ? "Con servicio" : "Sin servicio"}
        </span>
      </td>
      <td className="py-2 px-3">{c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString() : "—"}</td>
      {isAdmin && (
        <td className="py-2 px-3 text-right">
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onVerServicios?.(c)} className="text-xs px-3 py-1 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50">Servicios</button>
            <button type="button" onClick={() => onEditar(c)} className="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5">Editar</button>
            <button
              type="button"
              onClick={() => onToggleActivo?.(c)}
              className={`text-xs px-3 py-1 rounded-lg border ${c.activo ? "border-red-500 text-red-600 hover:bg-red-50" : "border-emerald-500 text-emerald-700 hover:bg-emerald-50"}`}
            >
              {c.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

const FILTROS_SERVICIO = [
  { value: "todos", label: "Todos serv.", activeClass: "bg-neutral-900 text-white" },
  { value: "con",   label: "Con servicio", activeClass: "bg-emerald-600 text-white" },
  { value: "sin",   label: "Sin servicio", activeClass: "bg-neutral-200 text-neutral-800" },
];

const FILTROS_ACTIVO = [
  { value: "activos",   label: "Activos",   activeClass: "bg-sky-700 text-white" },
  { value: "inactivos", label: "Inactivos", activeClass: "bg-neutral-700 text-white" },
  { value: "todos",     label: "Todos",     activeClass: "bg-neutral-900 text-white" },
];

export default function ClientesTable({ clientes, loading, onEditar, onVerServicios, onToggleActivo, isAdmin }) {
  const [filtroServicio, setFiltroServicio] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState("activos");
  const [filtroNombre, setFiltroNombre] = useState("");

  const clientesFiltrados = useMemo(() => {
    let data = [...clientes];
    if (filtroActivo === "activos") data = data.filter((c) => c.activo);
    else if (filtroActivo === "inactivos") data = data.filter((c) => !c.activo);
    if (filtroServicio === "con") data = data.filter((c) => c.tiene_servicio);
    else if (filtroServicio === "sin") data = data.filter((c) => !c.tiene_servicio);
    if (filtroNombre.trim()) {
      const q = filtroNombre.toLowerCase();
      data = data.filter((c) => (c.nombre || "").toLowerCase().includes(q));
    }
    return data;
  }, [clientes, filtroServicio, filtroActivo, filtroNombre]);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800">Listado de clientes</h2>
          <p className="text-[11px] text-neutral-500">Filtra por estado, servicio y busca por nombre.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
          <input
            type="text"
            className="border border-neutral-300 rounded-lg px-3 py-1.5 text-xs min-w-[200px]"
            placeholder="Buscar por nombre y apellidos..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
          <ToggleGroup value={filtroServicio} onChange={setFiltroServicio} options={FILTROS_SERVICIO} />
          <ToggleGroup value={filtroActivo} onChange={setFiltroActivo} options={FILTROS_ACTIVO} />
          {loading && <span className="text-xs text-neutral-500 whitespace-nowrap">Cargando…</span>}
        </div>
      </div>

      {!loading && clientes.length === 0 && <p className="text-sm text-neutral-500">No se encontraron clientes.</p>}
      {!loading && clientes.length > 0 && clientesFiltrados.length === 0 && (
        <p className="text-sm text-neutral-500">No hay clientes que coincidan con los filtros actuales.</p>
      )}

      {clientesFiltrados.length > 0 && (
        <div className="border border-neutral-100 rounded-lg overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-xs text-neutral-500 border-b">
                  {["Nombre y apellidos", "Correo", "Celular", "DNI", "Estado servicio", "Fecha registro"].map((h) => (
                    <th key={h} className="py-2 px-3">{h}</th>
                  ))}
                  {isAdmin && <th className="py-2 px-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <ClienteRow
                    key={c.id_cliente}
                    c={c}
                    isAdmin={isAdmin}
                    onEditar={onEditar}
                    onVerServicios={onVerServicios}
                    onToggleActivo={onToggleActivo}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
