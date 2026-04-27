import { useState } from "react";
import SeccionPanel from "./SeccionPanel";
import SeccionPerfilCuantitativo from "./campos/SeccionPerfilCuantitativo";
import SeccionExperiencia from "./campos/SeccionExperiencia";
import SeccionInvestigacion from "./campos/SeccionInvestigacion";
import SeccionIdiomas from "./campos/SeccionIdiomas";
import SeccionBecas from "./campos/SeccionBecas";
import SeccionPreferenciasMaster from "./campos/SeccionPreferenciasMaster";
import SeccionComentarioEspecial from "./campos/SeccionComentarioEspecial";

const STEPS = [
  { label: "Perfil",      icon: "🎓", title: "Tu perfil académico" },
  { label: "Experiencia", icon: "💼", title: "Experiencia e investigación" },
  { label: "Idiomas",     icon: "🗣️", title: "Idiomas y becas" },
  { label: "Máster",      icon: "🎯", title: "Tu máster ideal" },
  { label: "Extras",      icon: "💬", title: "Comentario especial" },
];

export default function FormularioDatosAcademicos({
  formData, setFormData, handleSubmitFormulario,
  savingForm, collapsed, onToggle, hasData,
}) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

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
      {/* ── Step indicator ── */}
      <div className="mb-6">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    i < step
                      ? "bg-emerald-500 text-white shadow-sm"
                      : i === step
                      ? "bg-[#023A4B] text-white ring-4 ring-[#023A4B]/15 shadow-md"
                      : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </button>
                <span className={`mt-1 text-[9px] font-semibold uppercase tracking-wide hidden sm:block ${
                  i === step ? "text-[#023A4B]" : i < step ? "text-emerald-600" : "text-neutral-300"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded transition-colors duration-300 ${i < step ? "bg-emerald-400" : "bg-neutral-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step card ── */}
      <form onSubmit={handleSubmitFormulario}>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {/* Header del paso */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#023A4B]/8 to-transparent border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{STEPS[step].icon}</span>
              <div>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Paso {step + 1} de {STEPS.length}
                </p>
                <h3 className="text-sm font-bold text-[#023A4B]">{STEPS[step].title}</h3>
              </div>
            </div>
            {/* Guardar silencioso desde cualquier paso */}
            <button
              type="submit"
              disabled={savingForm}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-neutral-400 hover:text-[#023A4B] hover:bg-neutral-50 rounded-lg disabled:opacity-40 transition-all border border-transparent hover:border-neutral-200"
            >
              {savingForm
                ? <span className="w-3 h-3 border-2 border-neutral-300 border-t-[#023A4B] rounded-full animate-spin" />
                : <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              }
              {savingForm ? "Guardando…" : "Guardar"}
            </button>
          </div>

          {/* Contenido */}
          <div className="p-5">
            {step === 0 && <SeccionPerfilCuantitativo formData={formData} setFormData={setFormData} />}
            {step === 1 && (
              <div className="space-y-7">
                <SeccionExperiencia formData={formData} setFormData={setFormData} />
                <div className="border-t border-dashed border-neutral-200 pt-6">
                  <SeccionInvestigacion formData={formData} setFormData={setFormData} />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-7">
                <SeccionIdiomas formData={formData} setFormData={setFormData} />
                <div className="border-t border-dashed border-neutral-200 pt-6">
                  <SeccionBecas formData={formData} setFormData={setFormData} />
                </div>
              </div>
            )}
            {step === 3 && <SeccionPreferenciasMaster formData={formData} setFormData={setFormData} />}
            {step === 4 && <SeccionComentarioEspecial formData={formData} setFormData={setFormData} />}
          </div>
        </div>

        {/* ── Navegación ── */}
        <div className="flex items-center justify-between mt-4 px-1">
          <button
            type="button"
            onClick={() => setStep(p => Math.max(0, p - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-30 hover:bg-neutral-50 transition"
          >
            ← Anterior
          </button>

          {isLast ? (
            <button
              type="submit"
              disabled={savingForm}
              className="inline-flex items-center gap-2 px-8 py-2.5 text-sm font-semibold rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] disabled:opacity-50 transition-all active:scale-95 shadow-sm"
            >
              {savingForm ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
              ) : (
                <>✓ Guardar formulario</>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(p => Math.min(STEPS.length - 1, p + 1))}
              className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold rounded-xl bg-[#023A4B] text-white hover:bg-[#035670] transition-all active:scale-95 shadow-sm"
            >
              Continuar →
            </button>
          )}
        </div>
      </form>
    </SeccionPanel>
  );
}
