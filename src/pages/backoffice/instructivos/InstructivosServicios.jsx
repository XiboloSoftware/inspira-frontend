// src/pages/backoffice/instructivos/InstructivosServicios.jsx
import { useEffect, useState } from "react";
import { useInstructivos } from "./hooks/useInstructivos";
import InstructivosList from "./components/InstructivosList";
import InstructivoForm from "./components/InstructivoForm";

export default function InstructivosServicios() {
  const [modalAbierto, setModalAbierto] = useState(false);

  const {
    servicios, loadingServicios, cargarServicios,
    selectedServicio, seleccionarServicio,
    instructivos, loadingInstructivos,
    form, setForm, modo, saving, subiendoArchivo,
    resetForm, editarInstructivo, eliminarInstructivo,
    handleUploadArchivo, guardar,
  } = useInstructivos();

  useEffect(() => { cargarServicios(); }, []);

  const serviciosOrdenados = [...servicios].sort(
    (a, b) => (b.cantidad_instructivos_activos || 0) - (a.cantidad_instructivos_activos || 0)
  );

  const servicioActual = servicios.find(s => s.id_servicio === selectedServicio);

  function abrirServicio(id) {
    seleccionarServicio(id);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    seleccionarServicio(null);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Instructivos y plantillas</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Haz clic en un servicio para ver y gestionar sus instructivos.
        </p>
      </div>

      {loadingServicios ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {serviciosOrdenados.map(s => {
            const count = s.cantidad_instructivos_activos || 0;
            return (
              <button
                key={s.id_servicio}
                onClick={() => abrirServicio(s.id_servicio)}
                className={`text-left border rounded-xl p-4 bg-white hover:border-primary/50 hover:shadow-md transition-all group ${
                  !s.activo ? "opacity-55" : "shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 leading-snug group-hover:text-primary transition-colors">
                      {s.nombre}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {s.codigo}{!s.activo && " · INACTIVO"}
                    </p>
                  </div>
                  <span className={`shrink-0 min-w-[28px] text-center text-[12px] font-bold px-2 py-0.5 rounded-full ${
                    count > 0
                      ? "bg-[#E8F5EE] text-[#1D6A4A]"
                      : "bg-neutral-100 text-neutral-400"
                  }`}>
                    {count}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 group-hover:text-primary/60 transition-colors">
                  {count === 0
                    ? "Sin instructivos — haz clic para añadir"
                    : `${count} instructivo${count > 1 ? "s" : ""} activo${count > 1 ? "s" : ""}`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-4 flex items-start justify-between gap-4 shrink-0">
              <div>
                <p className="text-sm font-bold text-white leading-snug">
                  {servicioActual?.nombre || "Servicio"}
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {servicioActual?.codigo}
                  {servicioActual && !servicioActual.activo && " · INACTIVO"}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="shrink-0 text-white/60 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Lista */}
                <div className="border border-neutral-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-800">Instructivos del servicio</h2>
                    {loadingInstructivos && (
                      <span className="text-xs text-neutral-400">Cargando…</span>
                    )}
                  </div>
                  <InstructivosList
                    instructivos={instructivos}
                    loading={loadingInstructivos}
                    selectedServicio={selectedServicio}
                    onEditar={editarInstructivo}
                    onEliminar={eliminarInstructivo}
                  />
                </div>

                {/* Formulario */}
                <div className="border border-neutral-200 rounded-xl p-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
