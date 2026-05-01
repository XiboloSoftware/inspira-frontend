// src/pages/backoffice/instructivos/InstructivosServicios.jsx
import { useEffect } from "react";
import { useInstructivos } from "./hooks/useInstructivos";
import InstructivosList from "./components/InstructivosList";
import InstructivoForm from "./components/InstructivoForm";

export default function InstructivosServicios() {
  const {
    servicios, loadingServicios, cargarServicios,
    selectedServicio, manejarCambioServicio,
    instructivos, loadingInstructivos,
    form, setForm, modo, saving, subiendoArchivo,
    resetForm, editarInstructivo, eliminarInstructivo,
    handleUploadArchivo, guardar,
  } = useInstructivos();

  useEffect(() => { cargarServicios(); }, []);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Instructivos y plantillas</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Configura los instructivos que verán los clientes en cada servicio.</p>
      </div>

      {/* Selector de servicio */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">Selecciona un servicio</label>
        <select
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          value={selectedServicio || ""}
          onChange={manejarCambioServicio}
        >
          <option value="">-- Selecciona --</option>
          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre} ({s.codigo}) {!s.activo ? "- INACTIVO " : ""}
              {s.cantidad_instructivos_activos ? `(${s.cantidad_instructivos_activos} activos)` : ""}
            </option>
          ))}
        </select>
        {loadingServicios && <p className="text-xs text-neutral-500 mt-1">Cargando servicios…</p>}
      </div>

      {/* Lista + Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800">Instructivos del servicio</h2>
            {loadingInstructivos && <span className="text-xs text-neutral-500">Cargando…</span>}
          </div>
          <InstructivosList
            instructivos={instructivos}
            loading={loadingInstructivos}
            selectedServicio={selectedServicio}
            onEditar={editarInstructivo}
            onEliminar={eliminarInstructivo}
          />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">
            {modo === "nuevo" ? "Nuevo instructivo" : "Editar instructivo"}
          </h2>
          <InstructivoForm
            form={form}
            setForm={setForm}
            modo={modo}
            saving={saving}
            subiendoArchivo={subiendoArchivo}
            onSubmit={guardar}
            onReset={resetForm}
            onUploadArchivo={handleUploadArchivo}
          />
        </div>
      </div>
    </div>
  );
}
