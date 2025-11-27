export default function Failure() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">Pago fallido</h1>
      <p className="mt-4">Hubo un problema con tu pago.</p>
      <a href="/diagnostico" className="text-blue-600 underline mt-4 block">
        Intentar otra vez
      </a>
    </div>
  );
}
