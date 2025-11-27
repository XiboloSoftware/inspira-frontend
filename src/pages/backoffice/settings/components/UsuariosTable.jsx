// src/pages/backoffice/settings/components/UsuariosTable.jsx
export default function UsuariosTable({
  usuarios,
  loading,
  onToggleActivo,
  onEditClick,
}) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b bg-neutral-50 text-sm font-semibold text-neutral-700">
        Staff registrado
      </div>

      {loading ? (
        <div className="p-4 text-sm text-neutral-600">Cargando...</div>
      ) : usuarios.length === 0 ? (
        <div className="p-4 text-sm text-neutral-600">
          No hay usuarios internos registrados.
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-4 py-2">Nombre</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Rol</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario} className="border-t">
                <td className="px-4 py-2">{u.nombre}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.rol}</td>
                <td className="px-4 py-2">
                  {u.activo ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => onEditClick(u)}
                    className="text-xs px-3 py-1 rounded-lg border text-neutral-700 hover:bg-neutral-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleActivo(u)}
                    className="text-xs px-3 py-1 rounded-lg border text-neutral-700 hover:bg-neutral-100"
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
