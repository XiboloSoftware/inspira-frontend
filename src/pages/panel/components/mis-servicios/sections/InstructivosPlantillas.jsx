// src/pages/panel/components/mis-servicios/sections/InstructivosPlantillas.jsx
export default function InstructivosPlantillas({ instructivos }) {
  const lista = Array.isArray(instructivos) ? instructivos : [];

  return (
    <section className="border rounded-lg p-3 h-full flex flex-col">
      {/* header fijo */}
      <div className="mb-2 shrink-0">
        <h3 className="text-sm font-semibold">2. Instructivo y plantillas</h3>
        <p className="text-xs text-neutral-500">Descarga la guía paso a paso.</p>
      </div>

      {/* body con scroll SIEMPRE */}
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        {lista.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Aún no hay instructivos configurados.
          </p>
        ) : (
          <ul className="space-y-2">
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
