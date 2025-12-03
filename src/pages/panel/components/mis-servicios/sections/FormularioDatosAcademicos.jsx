// src/pages/panel/components/mis-servicios/sections/FormularioDatosAcademicos.jsx

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
}) {
  return (
    <section className="md:col-span-2 border border-neutral-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-neutral-900 mb-2">
        3. Formulario de datos académicos
      </h3>

      <form className="space-y-6" onSubmit={handleSubmitFormulario}>
        {/* 0. Campos iniciales */}
        {/* (mantén aquí la parte de universidad_origen, grado_académico, etc.) */}

        <hr className="border-neutral-200" />

        <SeccionPerfilCuantitativo formData={formData} setFormData={setFormData} />

        <SeccionExperiencia formData={formData} setFormData={setFormData} />

        <SeccionInvestigacion formData={formData} setFormData={setFormData} />

        <SeccionIdiomas formData={formData} setFormData={setFormData} />

        <SeccionBecas formData={formData} setFormData={setFormData} />

        <SeccionPreferenciasMaster formData={formData} setFormData={setFormData} />

        <SeccionComentarioEspecial formData={formData} setFormData={setFormData} />

        {/* BOTÓN GUARDAR */}
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
    </section>
  );
}
