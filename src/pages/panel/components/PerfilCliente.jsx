// src/pages/panel/components/PerfilCliente.jsx



export default function PerfilCliente({ user }) {
  if (!user) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2 text-sm">
      <p>
        <strong>Nombre:</strong> {user.nombre || "-"}
      </p>
      <p>
        <strong>Email:</strong> {user.email_contacto || user.email || "-"}
      </p>
      {user.telefono && (
        <p>
          <strong>Teléfono:</strong> {user.telefono}
        </p>
      )}
      {user.dni && (
        <p>
          <strong>DNI:</strong> {user.dni}
        </p>
      )}
      {user.pais_origen && (
        <p>
          <strong>País de origen:</strong> {user.pais_origen}
        </p>
      )}
      {user.canal_origen && (
        <p>
          <strong>Canal de origen:</strong> {user.canal_origen}
        </p>
      )}
      {user.fecha_registro && (
        <p>
          <strong>Registrado el:</strong>{" "}
          {new Date(user.fecha_registro).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
