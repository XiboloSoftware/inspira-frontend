// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useState } from "react";
import { useSolicitudes, getBackofficeUser } from "./hooks/useSolicitudes";
import SolicitudRow, { SolicitudCard } from "./components/SolicitudRow";
import CreateSolicitudAdmin from "./CreateSolicitudAdmin";

export default function SolicitudesList({ onVerSolicitud }) {
  const [usuario] = useState(() => getBackofficeUser());
  const [mostrarCrear, setMostrarCrear] = useState(false);

  const {
    solicitudes, loading,
    searchCliente, setSearchCliente,
    page, pageSize, total, totalPages,
    cargarSolicitudes, eliminarSolicitud,
    handleSearchSubmit, changePage,
  } = useSolicitudes();

  const isAdmin = usuario?.rol === "admin";

  async function handleEliminar(id) {
    if (!isAdmin) return;
    if (!window.confirm("¿Seguro que quieres eliminar esta solicitud?")) return;
    eliminarSolicitud(id);
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-primary">Solicitudes</h1>
          <p className="text-sm text-neutral-500">Expedientes de clientes</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <input
              type="text"
              className="flex-1 min-w-0 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Buscar por cliente o correo…"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium whitespace-nowrap">
              Buscar
            </button>
          </form>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setMostrarCrear((v) => !v)}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium whitespace-nowrap"
            >
              {mostrarCrear ? "✕ Cerrar" : "+ Crear solicitud"}
            </button>
          )}
        </div>
      </div>

      {isAdmin && mostrarCrear && (
        <CreateSolicitudAdmin onCreated={() => { cargarSolicitudes({ page: 1 }); setMostrarCrear(false); }} />
      )}

      {/* Contenedor de lista */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Barra de estado */}
        <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <span className="text-sm font-semibold text-neutral-800">Listado</span>
          <span className="text-xs text-neutral-400">
            {loading ? "Cargando…" : `Pág. ${page}/${totalPages} · ${total} resultado${total === 1 ? "" : "s"}`}
          </span>
        </div>

        {loading && (
          <div className="p-8 text-center text-neutral-400 text-sm">Cargando solicitudes…</div>
        )}

        {!loading && solicitudes.length === 0 && (
          <p className="p-6 text-sm text-neutral-400 text-center">No se encontraron solicitudes.</p>
        )}

        {!loading && solicitudes.length > 0 && (
          <>
            {/* ── Desktop: tabla ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#e8f5ee] text-[#1a5c3a] text-left text-xs font-bold uppercase tracking-wide">
                    {["#ID", "Cliente", "Tipo", "Estado", "Origen", "Fecha", "Pagado", "Acciones"].map((h) => (
                      <th key={h} className={`px-3 py-3 ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <SolicitudRow key={s.id_solicitud} s={s} isAdmin={isAdmin} onVer={onVerSolicitud} onEliminar={handleEliminar} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Móvil: cards ── */}
            <div className="sm:hidden divide-y divide-neutral-100">
              {solicitudes.map((s) => (
                <SolicitudCard key={s.id_solicitud} s={s} isAdmin={isAdmin} onVer={onVerSolicitud} onEliminar={handleEliminar} />
              ))}
            </div>

            {/* Paginador */}
            <div className="px-4 py-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">Filas:</span>
                <select
                  value={pageSize}
                  onChange={(e) => cargarSolicitudes({ page: 1, pageSize: Number(e.target.value) })}
                  className="border border-neutral-200 rounded px-2 py-1 text-xs bg-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changePage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition"
                >
                  ← Ant.
                </button>
                <span className="text-neutral-500">Pág. {page}/{totalPages}</span>
                <button
                  type="button"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition"
                >
                  Sig. →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
