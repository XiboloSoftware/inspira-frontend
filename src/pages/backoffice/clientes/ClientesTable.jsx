// src/pages/backoffice/clientes/ClientesTable.jsx
import { useMemo, useState } from "react";

function initials(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 transition-colors ${i > 0 ? "border-l border-neutral-200" : ""} ${
            value === opt.value ? opt.activeClass : "bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ClienteCard({ c, isAdmin, onEditar, onVerServicios, onToggleActivo, onPurgar, onVerPerfil }) {
  const ini = initials(c.nombre);
  const fecha = c.fecha_registro
    ? new Date(c.fecha_registro).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Accent top bar */}
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: c.activo ? "#1D6A4A" : "#d1d5db" }} />

      {/* Card body */}
      <div className="p-4 flex-1 space-y-3">
        {/* Avatar + nombre */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0 select-none"
            style={{ backgroundColor: "#1A3557" }}
          >
            {ini}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold text-neutral-900 text-sm leading-tight">{c.nombre || "—"}</p>
              {!c.activo && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 leading-none">
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">{c.email_contacto}</p>
          </div>
        </div>

        {/* Servicio badge */}
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
            c.tiene_servicio
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-neutral-50 text-neutral-500 border-neutral-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${c.tiene_servicio ? "bg-emerald-500" : "bg-neutral-400"}`}
          />
          {c.tiene_servicio ? "Con servicio" : "Sin servicio"}
        </span>

        {/* Detalles */}
        <div className="space-y-1.5">
          {c.telefono && (
            <div className="flex gap-2 text-xs">
              <span className="text-neutral-400 w-9 shrink-0">Tel</span>
              <span className="text-neutral-700 truncate">{c.telefono}</span>
            </div>
          )}
          {c.pais_origen && (
            <div className="flex gap-2 text-xs">
              <span className="text-neutral-400 w-9 shrink-0">País</span>
              <span className="text-neutral-700 truncate">{c.pais_origen}</span>
            </div>
          )}
          {c.dni && (
            <div className="flex gap-2 text-xs">
              <span className="text-neutral-400 w-9 shrink-0">DNI</span>
              <span className="text-neutral-700">{c.dni}</span>
            </div>
          )}
          <div className="flex gap-2 text-xs">
            <span className="text-neutral-400 w-9 shrink-0">Alta</span>
            <span className="text-neutral-500">{fecha}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-3 pb-3 space-y-1.5">
        <button
          type="button"
          onClick={() => onVerPerfil?.(c)}
          className="w-full py-2 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1D6A4A" }}
        >
          Ver perfil completo
        </button>

        {isAdmin ? (
          <>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => onVerServicios?.(c)}
                className="py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:border-neutral-400 transition-colors"
              >
                Servicios
              </button>
              <button
                type="button"
                onClick={() => onEditar?.(c)}
                className="py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:border-[#1A3557] hover:text-[#1A3557] transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onToggleActivo?.(c)}
                className={`py-1.5 text-xs border rounded-lg transition-colors ${
                  c.activo
                    ? "border-red-200 text-red-500 hover:bg-red-50"
                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {c.activo ? "Desact." : "Activar"}
              </button>
            </div>
            {!c.activo && (
              <button
                type="button"
                onClick={() => onPurgar?.(c)}
                className="w-full py-1.5 text-xs border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Purgar datos permanentemente
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => onVerServicios?.(c)}
            className="w-full py-1.5 text-xs border border-neutral-200 rounded-lg text-neutral-600 hover:border-neutral-400 transition-colors"
          >
            Ver servicios
          </button>
        )}
      </div>
    </div>
  );
}

const FILTROS_SERVICIO = [
  { value: "todos", label: "Todos",      activeClass: "bg-neutral-900 text-white" },
  { value: "con",   label: "Con serv.",  activeClass: "bg-[#1D6A4A] text-white" },
  { value: "sin",   label: "Sin serv.",  activeClass: "bg-neutral-200 text-neutral-800" },
];

const FILTROS_ACTIVO = [
  { value: "activos",   label: "Activos",   activeClass: "bg-[#1A3557] text-white" },
  { value: "inactivos", label: "Inactivos", activeClass: "bg-neutral-700 text-white" },
  { value: "todos",     label: "Todos",     activeClass: "bg-neutral-900 text-white" },
];

export default function ClientesTable({
  clientes, loading,
  onEditar, onVerServicios, onToggleActivo, onPurgar, onVerPerfil,
  isAdmin,
}) {
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
            <p className="text-[11px] text-neutral-400 mt-0.5">
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

      {/* Estados vacíos */}
      {loading && (
        <p className="p-8 text-sm text-neutral-400 text-center">Cargando clientes…</p>
      )}
      {!loading && clientes.length === 0 && (
        <p className="p-8 text-sm text-neutral-400 text-center">No se encontraron clientes.</p>
      )}
      {!loading && clientes.length > 0 && clientesFiltrados.length === 0 && (
        <p className="p-8 text-sm text-neutral-400 text-center">Sin resultados para los filtros seleccionados.</p>
      )}

      {/* Grid de tarjetas */}
      {clientesFiltrados.length > 0 && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientesFiltrados.map((c) => (
            <ClienteCard
              key={c.id_cliente}
              c={c}
              isAdmin={isAdmin}
              onEditar={onEditar}
              onVerServicios={onVerServicios}
              onToggleActivo={onToggleActivo}
              onPurgar={onPurgar}
              onVerPerfil={onVerPerfil}
            />
          ))}
        </div>
      )}
    </div>
  );
}
