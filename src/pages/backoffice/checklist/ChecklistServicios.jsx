// src/pages/backoffice/checklist/ChecklistServicios.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";

export default function ChecklistServicios() {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [checklist, setChecklist] = useState(null); // { servicio, tipoSolicitud, etapas[] }
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  const [nuevoItem, setNuevoItem] = useState({
    nombre_item: "",
    descripcion: "",
    obligatorio: true,
    permite_archivo: true,
  });
  const [savingItem, setSavingItem] = useState(false);

  async function cargarServicios() {
    setLoadingServicios(true);
    const r = await boGET("/backoffice/checklist/servicios");
    if (r.ok) setServicios(r.servicios || []);
    setLoadingServicios(false);
  }

  async function cargarChecklist(id_servicio) {
    setLoadingChecklist(true);
    const r = await boGET(`/backoffice/checklist/servicios/${id_servicio}`);
    if (r.ok) {
      setChecklist({
        servicio: r.servicio,
        tipoSolicitud: r.tipoSolicitud,
        etapas: r.etapas,
      });
    }
    setLoadingChecklist(false);
  }

  useEffect(() => {
    cargarServicios();
  }, []);

  function manejarCambioServicio(e) {
    const val = e.target.value;
    if (!val) {
      setSelectedServicio(null);
      setChecklist(null);
      return;
    }
    const id = Number(val);
    setSelectedServicio(id);
    cargarChecklist(id);
  }

  async function crearItem(e) {
    e.preventDefault();
    if (!selectedServicio || !nuevoItem.nombre_item.trim()) return;

    setSavingItem(true);
    try {
      const r = await boPOST(`/backoffice/checklist/servicios/${selectedServicio}/items`, {
        ...nuevoItem,
      });
      if (!r.ok) {
        alert(r.msg || "No se pudo crear el ítem");
        return;
      }
      setNuevoItem({
        nombre_item: "",
        descripcion: "",
        obligatorio: true,
        permite_archivo: true,
      });
      await cargarChecklist(selectedServicio);
    } finally {
      setSavingItem(false);
    }
  }

  async function actualizarItem(id_item, cambiosParciales) {
    const r = await boPUT(`/backoffice/checklist/items/${id_item}`, cambiosParciales);
    if (!r.ok) {
      alert(r.msg || "No se pudo actualizar el ítem");
      return;
    }
    if (selectedServicio) {
      await cargarChecklist(selectedServicio);
    }
  }

  async function eliminarItem(id_item) {
    if (!window.confirm("¿Eliminar este ítem de checklist?")) return;
    const r = await boDELETE(`/backoffice/checklist/items/${id_item}`);
    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar el ítem");
      return;
    }
    if (selectedServicio) {
      await cargarChecklist(selectedServicio);
    }
  }

  const etapaPrincipal = checklist?.etapas?.[0];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-1">
        Checklist de Servicios
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Define los documentos requeridos para cada servicio. Estos ítems se podrán usar luego
        para que el cliente suba archivos y el asesor los revise.
      </p>

      {/* Selector de servicio */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-6">
        <label className="text-xs text-neutral-500 mb-1 block">
          Selecciona un servicio
        </label>
        <select
          className="border rounded-lg px-2 py-1.5 text-sm w-full max-w-md"
          value={selectedServicio || ""}
          onChange={manejarCambioServicio}
        >
          <option value="">-- Selecciona --</option>
          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre} ({s.codigo}) {s.activo ? "" : " [Inactivo]"}
            </option>
          ))}
        </select>
        {loadingServicios && (
          <p className="text-xs text-neutral-400 mt-2">Cargando servicios…</p>
        )}
      </div>

      {/* Checklist del servicio */}
      {selectedServicio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info servicio + tipoSolicitud */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            {loadingChecklist && <p className="text-xs text-neutral-400">Cargando checklist…</p>}
            {checklist && (
              <>
                <h2 className="text-sm font-semibold text-neutral-800 mb-2">
                  {checklist.servicio.nombre} ({checklist.servicio.codigo})
                </h2>
                <p className="text-xs text-neutral-500 mb-1">
                  Tipo de solicitud vinculado:
                </p>
                <p className="text-sm text-neutral-800">
                  {checklist.tipoSolicitud.nombre}
                </p>
                {checklist.tipoSolicitud.descripcion && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {checklist.tipoSolicitud.descripcion}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Lista de ítems */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 mb-2">
                Documentos requeridos
              </h3>

              {!etapaPrincipal && (
                <p className="text-sm text-neutral-500">
                  Aún no hay etapa de checklist. Se creará automáticamente al añadir el
                  primer ítem.
                </p>
              )}

              {etapaPrincipal && etapaPrincipal.items.length === 0 && (
                <p className="text-sm text-neutral-500">
                  No hay ítems definidos. Agrega los documentos requeridos para este servicio.
                </p>
              )}

              {etapaPrincipal && etapaPrincipal.items.length > 0 && (
                <div className="space-y-3">
                  {etapaPrincipal.items.map((item) => (
                    <div
                      key={item.id_item}
                      className="border border-neutral-200 rounded-lg px-3 py-2 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-900">
                            {item.nombre_item}
                          </span>
                          {item.obligatorio && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                              Obligatorio
                            </span>
                          )}
                        </div>
                        {item.descripcion && (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {item.descripcion}
                          </p>
                        )}
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {item.permite_archivo
                            ? "Este ítem requiere archivo adjunto."
                            : "Este ítem es sólo de verificación sin archivo."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={() =>
                            actualizarItem(item.id_item, {
                              obligatorio: !item.obligatorio,
                            })
                          }
                          className="text-[11px] px-2 py-1 rounded border hover:bg-neutral-50"
                        >
                          {item.obligatorio ? "Marcar como opcional" : "Marcar como obligatorio"}
                        </button>
                        <button
                          onClick={() =>
                            actualizarItem(item.id_item, {
                              permite_archivo: !item.permite_archivo,
                            })
                          }
                          className="text-[11px] px-2 py-1 rounded border hover:bg-neutral-50"
                        >
                          {item.permite_archivo
                            ? "Sin archivo"
                            : "Requiere archivo"}
                        </button>
                        <button
                          onClick={() => eliminarItem(item.id_item)}
                          className="text-[11px] px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form nuevo ítem */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-800 mb-2">
                Añadir nuevo documento
              </h3>
              <form className="space-y-3" onSubmit={crearItem}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">Nombre del documento</label>
                  <input
                    type="text"
                    className="border rounded-lg px-2 py-1.5 text-sm"
                    value={nuevoItem.nombre_item}
                    onChange={(e) =>
                      setNuevoItem((f) => ({ ...f, nombre_item: e.target.value }))
                    }
                    placeholder="DNI escaneado, Certificado de estudios, etc."
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">
                    Descripción (opcional)
                  </label>
                  <textarea
                    className="border rounded-lg px-2 py-1.5 text-sm min-h-[60px]"
                    value={nuevoItem.descripcion}
                    onChange={(e) =>
                      setNuevoItem((f) => ({ ...f, descripcion: e.target.value }))
                    }
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={nuevoItem.obligatorio}
                      onChange={(e) =>
                        setNuevoItem((f) => ({ ...f, obligatorio: e.target.checked }))
                      }
                    />
                    Obligatorio
                  </label>

                  <label className="flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={nuevoItem.permite_archivo}
                      onChange={(e) =>
                        setNuevoItem((f) => ({ ...f, permite_archivo: e.target.checked }))
                      }
                    />
                    Requiere archivo adjunto
                  </label>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingItem}
                    className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-light disabled:opacity-60"
                  >
                    {savingItem ? "Guardando…" : "Añadir ítem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
