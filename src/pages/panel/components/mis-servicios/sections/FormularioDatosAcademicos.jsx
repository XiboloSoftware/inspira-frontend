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
  const labelBotonToggle = collapsed
    ? hasData
      ? "Modificar datos"
      : "Ingresar datos"
    : "Ocultar formulario";

  const estadoLabel = hasData ? "Datos guardados" : "Pendiente de completar";
  const estadoColor = hasData
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <section className="border border-neutral-200 rounded-lg p-3 h-full flex flex-col">
      {/* HEADER FIJO */}
      <div className="shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-neutral-900">
            3. Formulario de datos académicos
          </h3>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${estadoColor}`}>
              {estadoLabel}
            </span>

            <button
              type="button"
              onClick={onToggle}
              className="text-[11px] px-3 py-1.5 rounded-md border border-[#023A4B] text-[#023A4B] hover:bg-[#023A4B] hover:text-white transition"
            >
              {labelBotonToggle}
            </button>
          </div>
        </div>

        {collapsed && (
          <p className="text-xs text-neutral-500 mt-1">
            {hasData
              ? "Haz clic en “Modificar datos” para revisar o actualizar la información que ya enviaste."
              : "Haz clic en “Ingresar datos” para completar este formulario. Esto ayudará a personalizar tu informe."}
          </p>
        )}
      </div>

      {/* CUERPO (SCROLL INTERNO CUANDO ESTÁ ABIERTO) */}
      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <form className="space-y-6 mt-3" onSubmit={handleSubmitFormulario}>
            <SeccionPerfilCuantitativo formData={formData} setFormData={setFormData} />
            <SeccionExperiencia formData={formData} setFormData={setFormData} />
            <SeccionInvestigacion formData={formData} setFormData={setFormData} />
            <SeccionIdiomas formData={formData} setFormData={setFormData} />
            <SeccionBecas formData={formData} setFormData={setFormData} />
            <SeccionPreferenciasMaster formData={formData} setFormData={setFormData} />
            <SeccionComentarioEspecial formData={formData} setFormData={setFormData} />

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingForm}
                className="text-xs px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
              >
                {savingForm ? "Guardando..." : "Guardar formulario"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
