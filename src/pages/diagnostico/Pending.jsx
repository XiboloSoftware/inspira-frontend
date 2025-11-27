export default function Pending() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-yellow-600">Pago pendiente</h1>
      <p className="mt-4">Tu pago está en revisión por Mercado Pago.</p>
      <a href="/dashboard" className="text-blue-600 underline mt-4 block">
        Ver estado
      </a>
    </div>
  );
}
