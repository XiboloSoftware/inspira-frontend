// inspira-frontend/src/pages/panel/components/mis-servicios/sections/FormularioDatosAcademicos.jsx
import SeccionPerfilCuantitativo from "./campos/SeccionPerfilCuantitativo";
import SeccionExperiencia from "./campos/SeccionExperiencia";
import SeccionInvestigacion from "./campos/SeccionInvestigacion";
import SeccionIdiomas from "./campos/SeccionIdiomas";
import SeccionBecas from "./campos/SeccionBecas";
import SeccionPreferenciasMaster from "./campos/SeccionPreferenciasMaster";
import SeccionComentarioEspecial from "./campos/SeccionComentarioEspecial";

export default function FormularioDatosAcademicos({
  formData,
  setFormData,
  handleSubmitFormulario,
  savingForm,
  collapsed,
  onToggle,
  hasData,
}) {
  const estadoLabel = hasData ? "Datos guardados" : "Pendiente de completar";
  const estadoColor = hasData
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  const estadoDot = hasData ? "bg-emerald-500" : "bg-amber-400";

  return (
    <section className="border border-neutral-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-6 pt-5 pb-4 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#046C8C] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Formulario de datos académicos
              </h3>
            </div>
            <p className="text-sm text-neutral-500 ml-9">
              {collapsed && hasData
                ? "Haz clic en "Modificar datos" para actualizar la información enviada."
                : collapsed
                ? "Completa este formulario para personalizar tu informe de búsqueda."
                : "Completa todos los campos y guarda los cambios."}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-9 sm:ml-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${estadoColor}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${estadoDot}`} />
              {estadoLabel}
            </span>

            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border-2 border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B] hover:text-white transition-all active:scale-95"
            >
              {collapsed ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  {hasData ? "Modificar datos" : "Ingresar datos"}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  Ocultar formulario
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CUERPO DEL FORMULARIO */}
      {!collapsed && (
        <div className="px-6 py-5">
          <form className="space-y-6" onSubmit={handleSubmitFormulario}>
            <SeccionPerfilCuantitativo formData={formData} setFormData={setFormData} />
            <SeccionExperiencia formData={formData} setFormData={setFormData} />
            <SeccionInvestigacion formData={formData} setFormData={setFormData} />
            <SeccionIdiomas formData={formData} setFormData={setFormData} />
            <SeccionBecas formData={formData} setFormData={setFormData} />
            <SeccionPreferenciasMaster formData={formData} setFormData={setFormData} />
            <SeccionComentarioEspecial formData={formData} setFormData={setFormData} />

            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="submit"
                disabled={savingForm}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {savingForm ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Guardar formulario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
