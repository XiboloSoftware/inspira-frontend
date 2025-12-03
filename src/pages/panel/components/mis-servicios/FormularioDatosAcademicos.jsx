import { useState } from "react";
import PerfilAcademicoSection from "./FormularioAcademico/PerfilAcademicoSection";
import ExperienciaSection from "./FormularioAcademico/ExperienciaSection";
import InvestigacionFormacionSection from "./FormularioAcademico/InvestigacionFormacionSection";
import IdiomasSection from "./FormularioAcademico/IdiomasSection";
import BecasSection from "./FormularioAcademico/BecasSection";
import PreferenciasMasterSection from "./FormularioAcademico/PreferenciasMasterSection";
import ComentarioIASection from "./FormularioAcademico/ComentarioIASection";

/**
 * value: objeto opcional para inicializar (por ejemplo, desde backend)
 * onChange: callback opcional que recibe el objeto completo del formulario
 */
const DEFAULT_FORM = {
  // 3.1 Perfil académico
  promedio_peru: "",
  otra_escala_activa: false,
  promedio_otra_escala_valor: "",
  promedio_otra_escala_tipo: "",
  ubicacion_grupo: "", // tercio | quinto | decimo | ninguno
  otra_maestria_tiene: "", // si | no
  otra_maestria_detalle: "",

  // 3.2 Experiencia
  experiencia_anios: "", // sin | 2-3 | 3-5 | 5-10 | 10+
  experiencia_vinculada: "", // si | no
  experiencia_vinculada_detalle: "",

  // 3.3 Investigación y formación
  investigacion_experiencia: "", // si | no
  investigacion_detalle: "",
  formacion_otra_maestria: false,
  formacion_diplomados: false,
  formacion_encuentros: false,
  formacion_otros: false,
  formacion_otros_detalle: "",

  // 3.4 Idiomas
  ingles_situacion: "", // uni | intl | instituto | sin_cert | no
  ingles_uni_nivel: "",
  ingles_intl_tipo: "",
  ingles_intl_puntaje: "",
  idioma_master_es: false,
  idioma_master_bilingue: false,
  idioma_master_ingles: false,

  // 3.5 Becas
  beca_desea: "", // si | no
  beca_completa: false,
  beca_parcial: false,
  beca_ayuda_uni: false,

  // 3.6 Preferencias máster
  duracion_preferida: "",
  practicas_preferencia: "",
  presupuesto_desde: "",
  presupuesto_hasta: "",

  // 3.7 Comentario IA
  comentario_especial: "",
};

export default function FormularioDatosAcademicos({ value, onChange }) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(value || {}),
  }));

  function updateField(name, val) {
    setForm((prev) => {
      const next = { ...prev, [name]: val };
      if (typeof onChange === "function") {
        onChange(next);
      }
      return next;
    });
  }

  return (
    <div className="mt-6 border border-neutral-200 rounded-xl bg-white shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        3. Formulario de datos académicos
      </h3>
      <p className="text-sm text-neutral-500 mb-6">
        Completa estos datos para que el equipo Inspira pueda ayudarte a
        seleccionar los másteres y universidades más adecuados para ti.
      </p>

      <div className="space-y-8">
        <PerfilAcademicoSection form={form} updateField={updateField} />
        <ExperienciaSection form={form} updateField={updateField} />
        <InvestigacionFormacionSection form={form} updateField={updateField} />
        <IdiomasSection form={form} updateField={updateField} />
        <BecasSection form={form} updateField={updateField} />
        <PreferenciasMasterSection form={form} updateField={updateField} />
        <ComentarioIASection form={form} updateField={updateField} />
      </div>
    </div>
  );
}
