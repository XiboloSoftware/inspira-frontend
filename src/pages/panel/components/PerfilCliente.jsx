// src/pages/panel/components/PerfilCliente.jsx
export default function PerfilCliente({ user }) {
  if (!user) return <p>Cargando datos...</p>;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <p className="mb-2">
        <strong>Nombre:</strong> {user.nombre}
      </p>
      <p className="mb-2">
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
}
