// src/pages/backoffice/solicitudes/SolicitudesList.jsx
import { useEffect, useState, useMemo } from "react";
import { boGET, boDELETE } from "../../../services/backofficeApi";
import CreateSolicitudAdmin from "./CreateSolicitudAdmin";

function getBackofficeUser() {
  try {
    const token = localStorage.getItem("bo_token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function SolicitudesList({ onVerSolicitud }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [usuario] = useState(() => getBackofficeUser());
  const [mostrarCrear, setMostrarCrear] = useState(false);

  // filtros/paginación UI
  const [searchCliente, setSearchCliente] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(Math.ceil(total / pageSize) || 1, 1),
    [total, pageSize]
  );

  async function cargarSolicitudes(opts) {
    const pageToUse = opts?.page ?? page;
    const pageSizeToUse = opts?.pageSize ?? pageSize;
    const searchToUse = opts?.searchCliente ?? searchCliente;

    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", pageToUse);
    params.set("pageSize", pageSizeToUse);
    if (searchToUse.trim()) {
      params.set("q", searchToUse.trim());
    }

    const r = await boGET(`/backoffice/solicitudes?${params.toString()}`);
    if (r.ok) {
      setSolicitudes(r.solicitudes || []);
      setTotal(r.pagination?.total || 0);
      setPage(r.pagination?.page || pageToUse);
      setPageSize(r.pagination?.pageSize || pageSizeToUse);
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarSolicitudes({ page: 1 }); // primera carga
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleVerSolicitud(id) {
    if (onVerSolicitud) onVerSolicitud(id);
  }

  function handleSolicitudCreada(nueva) {
    // refresco completo para respetar paginación
    cargarSolicitudes({ page: 1 });
    setMostrarCrear(false);
  }

  async function handleEliminarSolicitud(id_solicitud) {
    if (!usuario || usuario.rol !== "admin") return;

    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta solicitud? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    const r = await boDELETE(`/backoffice/solicitudes/${id_solicitud}`);
    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar la solicitud");
      return;
    }

    // Si en la página actual solo quedaba una, puede que quieras retroceder de página
    const isLastInPage = solicitudes.length === 1 && page > 1;
    const newPage = isLastInPage ? page - 1 : page;
    cargarSolicitudes({ page: newPage });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    cargarSolicitudes({ page: 1, searchCliente });
  }

  function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    cargarSolicitudes({ page: newPage });
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabecera + crear */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Solicitudes</h1>
          <p className="text-sm text-neutral-600">
            Expedientes de clientes (incluye los generados por pago).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Buscador por nombre/cliente */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
              placeholder="Buscar por cliente o correo..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg"
            >
              Buscar
            </button>
          </form>

          {usuario?.rol === "admin" && (
            <button
              type="button"
              onClick={() => setMostrarCrear((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256]"
            >
              {mostrarCrear ? "Cerrar formulario" : "Crear solicitud"}
            </button>
          )}
        </div>
      </div>

      {/* Form crear */}
      {usuario?.rol === "admin" && mostrarCrear && (
        <CreateSolicitudAdmin onCreated={handleSolicitudCreada} />
      )}

      {/* Listado en tabla + scroll + paginación */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-neutral-800">
            Listado de solicitudes
          </span>
          <div className="text-xs text-neutral-500 flex items-center gap-3">
            {loading && <span>Cargando…</span>}
            {!loading && (
              <span>
                Página {page} de {totalPages} · {total} resultado
                {total === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {(!solicitudes || solicitudes.length === 0) && !loading && (
          <p className="px-4 py-3 text-sm text-neutral-500">
            No se encontraron solicitudes.
          </p>
        )}

        {solicitudes && solicitudes.length > 0 && (
          <>
            <div className="max-h-[480px] overflow-y-auto overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b">
                  <tr className="text-left text-xs text-neutral-500">
                    <th className="px-3 py-2">#ID</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Origen</th>
                    <th className="px-3 py-2">Fecha creación</th>
                    <th className="px-3 py-2">Pagado</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => {
                    const moneda = s.pagos?.[0]?.moneda || "";
                    const totalPagado = (s.pagos || [])
                      .filter((p) => p.estado_pago === "pagado")
                      .reduce((acc, p) => acc + p.monto, 0);

                    return (
                      <tr
                        key={s.id_solicitud}
                        className="border-b last:border-0 hover:bg-neutral-50"
                      >
                        <td className="px-3 py-2 text-xs text-neutral-700">
                          #{s.id_solicitud}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-900">
                              {s.cliente_nombre || "Cliente sin nombre"}
                            </span>
                            {s.cliente_email && (
                              <span className="text-[11px] text-neutral-500">
                                {s.cliente_email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {s.tipo ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                              {s.tipo}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {s.estado ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {s.estado}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-600">
                          {s.origen || "N/D"}
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-600">
                          {s.fecha_creacion
                            ? new Date(s.fecha_creacion).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-700">
                          {totalPagado > 0
                            ? `${totalPagado} ${moneda}`
                            : "0"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleVerSolicitud(s.id_solicitud)
                              }
                              className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
                            >
                              Ver
                            </button>

                            {usuario?.rol === "admin" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEliminarSolicitud(s.id_solicitud)
                                }
                                className="text-[11px] px-3 py-1.5 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* paginador */}
            <div className="px-4 py-3 border-t border-neutral-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>Filas por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    cargarSolicitudes({
                      page: 1,
                      pageSize: Number(e.target.value),
                    })
                  }
                  className="border border-neutral-300 rounded px-2 py-1 text-xs"
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
                  className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-50"
                >
                  «
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-50"
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
