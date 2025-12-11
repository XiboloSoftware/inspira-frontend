// src/pages/backoffice/clientes/ClientesTable.jsx

export default function ClientesTable({
  clientes,
  loading,
  onEditar,
  onVerServicios,
  onEliminar,        // NUEVO

  isAdmin,
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-800">
          Listado de clientes
        </h2>
        {loading && (
          <span className="text-xs text-neutral-500">Cargando…</span>
        )}
      </div>

      {clientes.length === 0 && !loading && (
        <p className="text-sm text-neutral-500">
          No se encontraron clientes con los criterios actuales.
        </p>
      )}

      {clientes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-neutral-500 border-b">
                <th className="py-2 pr-4">Nombre y apellidos</th>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4">Celular</th>
                <th className="py-2 pr-4">DNI</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Fecha registro</th>
                {isAdmin && (
                  <th className="py-2 pr-4 text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr
                  key={c.id_cliente}
                  className="border-b last:border-0 hover:bg-neutral-50"
                >
                  <td className="py-2 pr-4">{c.nombre || "—"}</td>
                  <td className="py-2 pr-4">{c.email_contacto}</td>
                  <td className="py-2 pr-4">{c.telefono || "—"}</td>
                  <td className="py-2 pr-4">{c.dni || "—"}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${c.tiene_servicio
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-600"
                        }`}
                    >
                      {c.tiene_servicio ? "Con servicio" : "Sin servicio"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {c.fecha_registro
                      ? new Date(c.fecha_registro).toLocaleDateString()
                      : "—"}
                  </td>
                  {isAdmin && (
                    <td className="py-2 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onVerServicios && onVerServicios(c)}
                          className="text-xs px-3 py-1 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                        >
                          Servicios
                        </button>

                        <button
                          type="button"
                          onClick={() => onEditar(c)}
                          className="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary/5"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => onEliminar && onEliminar(c)}
                          className="text-xs px-3 py-1 rounded-lg border border-red-500 text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
