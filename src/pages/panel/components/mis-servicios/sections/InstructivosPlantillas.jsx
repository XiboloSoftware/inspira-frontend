// src/pages/panel/components/mis-servicios/sections/InstructivosPlantillas.jsx
export default function InstructivosPlantillas({ instructivos }) {
  const lista = Array.isArray(instructivos) ? instructivos : [];

  return (
    <section className="border rounded-lg p-3 h-full flex flex-col">
      {/* Header fijo */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold">2. Instructivo y plantillas</h3>
        <p className="text-xs text-neutral-500">Descarga la guía paso a paso.</p>
      </div>

      {/* Body que estira */}
      <div className="flex-1 min-h-0">
        {lista.length === 0 ? (
          <div className="h-full flex items-center justify-center border border-dashed rounded-md p-4">
            <p className="text-xs text-neutral-500 text-center">
              Aún no hay instructivos configurados.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 h-full overflow-auto pr-1">
            {lista.map((doc) => (
              <li
                key={doc.url}
                className="flex items-center justify-between gap-3 text-xs border rounded-md px-2 py-1.5"
              >
                <span className="min-w-0 truncate">{doc.label}</span>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="shrink-0 text-[#023A4B] underline"
                >
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
