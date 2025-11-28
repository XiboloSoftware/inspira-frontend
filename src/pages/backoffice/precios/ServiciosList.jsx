// src/pages/backoffice/precios/ServiciosList.jsx

export default function ServiciosList({ servicios, loading, onEditar, onChecklist }) {
  // Ordenar: activos primero
  const ordenados = [...servicios].sort((a, b) => Number(b.activo) - Number(a.activo));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-800">Servicios configurados</h2>
        {loading && <span className="text-xs text-neutral-500">Cargando…</span>}
      </div>

      {ordenados.length === 0 && !loading && (
        <p className="text-sm text-neutral-500">Aún no hay servicios configurados.</p>
      )}

      <div className="divide-y">
        {ordenados.map((s) => (
          <div
            key={s.id_servicio}
            className="py-3 flex items-center justify-between gap-4"
          >
            <div>
              {/* Nombre + Código + Estado */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{s.nombre}</span>

                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {s.codigo}
                </span>

                {!s.activo && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Inactivo
                  </span>
                )}
              </div>

              {/* Descripción */}
              {s.descripcion && (
                <div className="text-xs text-neutral-500 mt-0.5">{s.descripcion}</div>
              )}

              {/* Precio */}
              <div className="text-sm text-neutral-800 mt-1">
                {s.precio_actual ? (
                  <>
                    <span className="font-semibold">
                      {s.precio_actual.moneda} {s.precio_actual.monto.toFixed(2)}
                    </span>{" "}
                    <span className="text-xs text-neutral-500">
                      (desde {new Date(s.precio_actual.vigente_desde).toLocaleDateString()})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500">Sin precio configurado</span>
                )}
              </div>
            </div>

            {/* BOTONES: Editar + Checklist */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => onEditar(s)}
                className="px-3 py-1.5 rounded-lg border text-xs hover:bg-neutral-50"
              >
                Editar
              </button>

              <button
                onClick={() => onChecklist(s)}
                className="px-3 py-1.5 rounded-lg border text-xs text-blue-600 hover:bg-blue-50"
              >
                Checklist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
