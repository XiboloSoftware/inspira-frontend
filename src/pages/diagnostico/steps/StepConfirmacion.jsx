export default function StepConfirmacion({ slot, user }) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-bold text-primary">Reserva confirmada</h2>
      <p className="text-neutral-700">
        Gracias {user?.nombre}. Tu diagnóstico quedó reservado para:
      </p>

      <div className="rounded-xl border border-neutral-200 p-4 inline-block">
        <div className="font-semibold text-primary">
          {slot?.hora_inicio} - {slot?.hora_fin}
        </div>
      </div>

      <a href="/panel" className="block text-primary underline">
        Ir a mi panel
      </a>
    </div>
  );
}
