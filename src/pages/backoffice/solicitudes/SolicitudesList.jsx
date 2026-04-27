// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useState } from "react";
import { useSolicitudes, getBackofficeUser } from "./hooks/useSolicitudes";
import SolicitudRow from "./components/SolicitudRow";
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
    if (!window.confirm("¿Seguro que quieres eliminar esta solicitud? Esta acción no se puede deshacer.")) return;
    eliminarSolicitud(id);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Solicitudes</h1>
          <p className="text-sm text-neutral-600">Expedientes de clientes (incluye los generados por pago).</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Buscar por cliente o correo..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
            <button type="submit" className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg">Buscar</button>
          </form>
          {isAdmin && (
            <button type="button" onClick={() => setMostrarCrear((v) => !v)} className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]">
              {mostrarCrear ? "Cerrar formulario" : "Crear solicitud"}
            </button>
          )}
        </div>
      </div>

      {isAdmin && mostrarCrear && (
        <CreateSolicitudAdmin onCreated={() => { cargarSolicitudes({ page: 1 }); setMostrarCrear(false); }} />
      )}

      {/* Tabla */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">Listado de solicitudes</span>
          <span className="text-xs text-neutral-500">
            {loading ? "Cargando…" : `Página ${page} de ${totalPages} · ${total} resultado${total === 1 ? "" : "s"}`}
          </span>
        </div>

        {!loading && solicitudes.length === 0 && (
          <p className="px-4 py-3 text-sm text-neutral-500">No se encontraron solicitudes.</p>
        )}

        {solicitudes.length > 0 && (
          <>
            <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b">
                  <tr className="text-left text-xs text-neutral-500">
                    {["#ID", "Cliente", "Tipo", "Estado", "Origen", "Fecha creación", "Pagado", "Acciones"].map((h) => (
                      <th key={h} className={`px-3 py-2 ${h === "Acciones" ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <SolicitudRow
                      key={s.id_solicitud}
                      s={s}
                      isAdmin={isAdmin}
                      onVer={onVerSolicitud}
                      onEliminar={handleEliminar}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginador */}
            <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <select value={pageSize} onChange={(e) => cargarSolicitudes({ page: 1, pageSize: Number(e.target.value) })} className="border border-neutral-300 rounded px-2 py-1 text-xs">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1} className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-50">«</button>
                <span>Página {page} de {totalPages}</span>
                <button type="button" onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-50">»</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
