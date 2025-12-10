// src/pages/panel/components/mis-servicios/sections/InstructivosPlantillas.jsx
export default function InstructivosPlantillas({ instructivos }) {
  return (
    <section className="border rounded-lg p-3">
      <h3 className="text-sm font-semibold mb-2">2. Instructivo y plantillas</h3>
      <p className="text-xs text-neutral-500 mb-2">
        Descarga la guía paso a paso.
      </p>

      {instructivos.length === 0 && (
        <p className="text-xs text-neutral-500">
          Aún no hay instructivos configurados.
        </p>
      )}

      <ul className="space-y-2">
        {instructivos.map((doc) => (
          <li
            key={doc.url}
            className="flex justify-between text-xs border rounded-md px-2 py-1.5"
          >
            <span>{doc.label}</span>
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              download
              className="text-[#023A4B] underline"
            >
              Descargar
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
