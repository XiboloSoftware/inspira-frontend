export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card title="Diagnósticos pagados hoy" value="—" />
        <Card title="Leads nuevos" value="—" />
        <Card title="Documentos pendientes" value="—" />
        <Card title="Expedientes activos" value="—" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <p className="text-neutral-700">
          Aquí irá el resumen de actividad (reservas, solicitudes, checklist).
        </p>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-secondary-light border border-neutral-200 rounded-xl p-4">
      <div className="text-sm text-neutral-700">{title}</div>
      <div className="text-3xl font-bold text-primary mt-2">{value}</div>
    </div>
  );
}
