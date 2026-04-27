// inspira-frontend/src/pages/panel/components/mis-servicios/sections/FormularioDatosAcademicos.jsx
import SeccionPanel from "./SeccionPanel";
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
  const estado = hasData ? "completado" : "pendiente";
  const subtitulo = hasData
    ? "Ya tienes datos guardados. Haz clic para revisar o modificar."
    : "Completa este formulario para personalizar tu informe de búsqueda.";

  return (
    <SeccionPanel
      numero="3"
      titulo="Formulario de datos académicos"
      subtitulo={subtitulo}
      estado={estado}
      open={!collapsed}
      onToggle={onToggle}
    >
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
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition-all active:scale-95"
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
    </SeccionPanel>
  );
}
