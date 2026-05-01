// src/pages/backoffice/checklist/ChecklistServicios.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi";
import ChecklistItemsList from "./components/ChecklistItemsList";
import ChecklistItemForm from "./components/ChecklistItemForm";

const ITEM_INICIAL = { nombre_item: "", descripcion: "", obligatorio: true, permite_archivo: true };

export default function ChecklistServicios() {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [nuevoItem, setNuevoItem] = useState(ITEM_INICIAL);
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => { cargarServicios(); }, []);

  async function cargarServicios() {
    setLoadingServicios(true);
    const r = await boGET("/backoffice/checklist/servicios");
    if (r.ok) setServicios(r.servicios || []);
    setLoadingServicios(false);
  }

  async function cargarChecklist(id_servicio) {
    setLoadingChecklist(true);
    const r = await boGET(`/backoffice/checklist/servicios/${id_servicio}`);
    if (r.ok) setChecklist({ servicio: r.servicio, tipoSolicitud: r.tipoSolicitud, etapas: r.etapas });
    setLoadingChecklist(false);
  }

  function manejarCambioServicio(e) {
    const val = e.target.value;
    if (!val) { setSelectedServicio(null); setChecklist(null); return; }
    const id = Number(val);
    setSelectedServicio(id);
    cargarChecklist(id);
  }

  async function crearItem(e) {
    e.preventDefault();
    if (!selectedServicio || !nuevoItem.nombre_item.trim()) return;
    setSavingItem(true);
    try {
      const r = await boPOST(`/backoffice/checklist/servicios/${selectedServicio}/items`, nuevoItem);
      if (!r.ok) { alert(r.msg || "No se pudo crear el ítem"); return; }
      setNuevoItem(ITEM_INICIAL);
      await cargarChecklist(selectedServicio);
    } finally {
      setSavingItem(false);
    }
  }

  async function actualizarItem(id_item, cambios) {
    const r = await boPUT(`/backoffice/checklist/items/${id_item}`, cambios);
    if (!r.ok) { alert(r.msg || "No se pudo actualizar el ítem"); return; }
    if (selectedServicio) await cargarChecklist(selectedServicio);
  }

  async function eliminarItem(id_item) {
    if (!window.confirm("¿Eliminar este ítem de checklist?")) return;
    const r = await boDELETE(`/backoffice/checklist/items/${id_item}`);
    if (!r.ok) { alert(r.msg || "No se pudo eliminar el ítem"); return; }
    if (selectedServicio) await cargarChecklist(selectedServicio);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Checklist de Servicios</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Define los documentos requeridos para cada servicio.</p>
      </div>

      {/* Selector de servicio */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Selecciona un servicio</label>
        <select className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" value={selectedServicio || ""} onChange={manejarCambioServicio}>
          <option value="">-- Selecciona --</option>
          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre} ({s.codigo}) {s.activo ? "" : " [Inactivo]"}
            </option>
          ))}
        </select>
        {loadingServicios && <p className="text-xs text-neutral-400 mt-2">Cargando servicios…</p>}
      </div>

      {selectedServicio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info servicio */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            {loadingChecklist && <p className="text-xs text-neutral-400">Cargando checklist…</p>}
            {checklist && (
              <>
                <h2 className="text-sm font-semibold text-neutral-800 mb-2">
                  {checklist.servicio.nombre} ({checklist.servicio.codigo})
                </h2>
                <p className="text-xs text-neutral-500 mb-1">Tipo de solicitud vinculado:</p>
                <p className="text-sm text-neutral-800">{checklist.tipoSolicitud.nombre}</p>
                {checklist.tipoSolicitud.descripcion && (
                  <p className="text-xs text-neutral-500 mt-1">{checklist.tipoSolicitud.descripcion}</p>
                )}
              </>
            )}
          </div>

          {/* Lista + Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-800 mb-2">Documentos requeridos</h3>
              <ChecklistItemsList
                etapa={checklist?.etapas?.[0]}
                onActualizar={actualizarItem}
                onEliminar={eliminarItem}
              />
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-800 mb-2">Añadir nuevo documento</h3>
              <ChecklistItemForm
                nuevoItem={nuevoItem}
                setNuevoItem={setNuevoItem}
                saving={savingItem}
                onSubmit={crearItem}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
