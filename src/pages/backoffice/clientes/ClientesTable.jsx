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

// Fila de tabla — solo desktop
function ClienteRow({ c, isAdmin, onEditar, onVerServicios, onToggleActivo, onPurgar }) {
  return (
    <tr className="border-b last:border-0 hover:bg-neutral-50">
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900">{c.nombre || "—"}</span>
          {!c.activo && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-600">Inactivo</span>}
        </div>
      </td>
      <td className="py-2 px-3 text-sm text-neutral-600 max-w-[160px] truncate">{c.email_contacto}</td>
      <td className="py-2 px-3 text-sm text-neutral-600 whitespace-nowrap">{c.telefono || "—"}</td>
      <td className="py-2 px-3 text-sm text-neutral-600">{c.dni || "—"}</td>
      <td className="py-2 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.tiene_servicio ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"}`}>
          {c.tiene_servicio ? "Con servicio" : "Sin servicio"}
        </span>
      </td>
      <td className="py-2 px-3 text-xs text-neutral-500 whitespace-nowrap">
        {c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString("es-ES") : "—"}
      </td>
      {isAdmin && (
        <td className="py-2 px-3 text-right">
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={() => onVerServicios?.(c)} className="text-xs px-2.5 py-1 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50">Servicios</button>
            <button type="button" onClick={() => onEditar(c)} className="text-xs px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5">Editar</button>
            <button
              type="button"
              onClick={() => onToggleActivo?.(c)}
              className={`text-xs px-2.5 py-1 rounded-lg border ${c.activo ? "border-red-400 text-red-600 hover:bg-red-50" : "border-emerald-400 text-emerald-700 hover:bg-emerald-50"}`}
            >
              {c.activo ? "Desactivar" : "Activar"}
            </button>
            {!c.activo && (
              <button
                type="button"
                onClick={() => onPurgar?.(c)}
                className="text-xs px-2.5 py-1 rounded-lg border border-red-600 text-red-700 hover:bg-red-50"
              >
                Purgar
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

// Card para móvil
function ClienteCard({ c, isAdmin, onEditar, onVerServicios, onToggleActivo, onPurgar }) {
  return (
    <div className="p-4 border-b last:border-0 hover:bg-neutral-50 active:bg-neutral-100">
      {/* Nombre + badges */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-sm font-semibold text-neutral-900 leading-snug">{c.nombre || "—"}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{c.email_contacto}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${c.tiene_servicio ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
            {c.tiene_servicio ? "Con servicio" : "Sin servicio"}
          </span>
          {!c.activo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-500">Inactivo</span>}
        </div>
      </div>

      {/* Datos secundarios */}
      {(c.telefono || c.dni) && (
        <div className="flex gap-4 mb-2 mt-1">
          {c.telefono && <span className="text-xs text-neutral-500">📞 {c.telefono}</span>}
          {c.dni && <span className="text-xs text-neutral-500">ID: {c.dni}</span>}
        </div>
      )}

      {/* Acciones */}
      {isAdmin && (
        <div className="flex gap-2 mt-2 flex-wrap">
          <button type="button" onClick={() => onVerServicios?.(c)} className="flex-1 min-w-[80px] text-xs py-2 rounded-lg border border-emerald-400 text-emerald-700 font-medium active:bg-emerald-50">
            Servicios
          </button>
          <button type="button" onClick={() => onEditar(c)} className="flex-1 min-w-[80px] text-xs py-2 rounded-lg border border-primary text-primary font-medium active:bg-primary/5">
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleActivo?.(c)}
            className={`flex-1 min-w-[80px] text-xs py-2 rounded-lg border font-medium ${c.activo ? "border-red-400 text-red-600 active:bg-red-50" : "border-emerald-400 text-emerald-700 active:bg-emerald-50"}`}
          >
            {c.activo ? "Desactivar" : "Activar"}
          </button>
          {!c.activo && (
            <button
              type="button"
              onClick={() => onPurgar?.(c)}
              className="flex-1 min-w-[80px] text-xs py-2 rounded-lg border border-red-600 text-red-700 font-medium active:bg-red-50"
            >
              Purgar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const FILTROS_SERVICIO = [
  { value: "todos", label: "Todos", activeClass: "bg-neutral-900 text-white" },
  { value: "con",   label: "Con serv.", activeClass: "bg-emerald-600 text-white" },
  { value: "sin",   label: "Sin serv.", activeClass: "bg-neutral-200 text-neutral-800" },
];

const FILTROS_ACTIVO = [
  { value: "activos",   label: "Activos",   activeClass: "bg-sky-700 text-white" },
  { value: "inactivos", label: "Inactivos", activeClass: "bg-neutral-700 text-white" },
  { value: "todos",     label: "Todos",     activeClass: "bg-neutral-900 text-white" },
];

export default function ClientesTable({ clientes, loading, onEditar, onVerServicios, onToggleActivo, onPurgar, isAdmin }) {
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
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Filtros */}
      <div className="p-4 border-b border-neutral-100 bg-neutral-50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-800">Listado de clientes</h2>
            <p className="text-[11px] text-neutral-400">
              {loading ? "Cargando…" : `${clientesFiltrados.length} de ${clientes.length} clientes`}
            </p>
          </div>
        </div>

        <input
          type="text"
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          placeholder="Buscar por nombre…"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <ToggleGroup value={filtroServicio} onChange={setFiltroServicio} options={FILTROS_SERVICIO} />
          <ToggleGroup value={filtroActivo} onChange={setFiltroActivo} options={FILTROS_ACTIVO} />
        </div>
      </div>

      {loading && <p className="p-6 text-sm text-neutral-400 text-center">Cargando clientes…</p>}

      {!loading && clientes.length === 0 && (
        <p className="p-6 text-sm text-neutral-400 text-center">No se encontraron clientes.</p>
      )}

      {!loading && clientes.length > 0 && clientesFiltrados.length === 0 && (
        <p className="p-6 text-sm text-neutral-400 text-center">Sin resultados para los filtros seleccionados.</p>
      )}

      {clientesFiltrados.length > 0 && (
        <>
          {/* ── Desktop: tabla ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-white">
                <tr className="text-left text-xs text-neutral-400">
                  {["Nombre y apellidos", "Correo", "Celular", "DNI", "Servicio", "Fecha"].map((h) => (
                    <th key={h} className="py-2 px-3 font-medium">{h}</th>
                  ))}
                  {isAdmin && <th className="py-2 px-3 text-right font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <ClienteRow key={c.id_cliente} c={c} isAdmin={isAdmin} onEditar={onEditar} onVerServicios={onVerServicios} onToggleActivo={onToggleActivo} onPurgar={onPurgar} />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Móvil: cards ── */}
          <div className="sm:hidden divide-y divide-neutral-100">
            {clientesFiltrados.map((c) => (
              <ClienteCard key={c.id_cliente} c={c} isAdmin={isAdmin} onEditar={onEditar} onVerServicios={onVerServicios} onToggleActivo={onToggleActivo} onPurgar={onPurgar} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
