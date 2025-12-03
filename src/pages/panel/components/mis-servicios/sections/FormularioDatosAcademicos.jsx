// src/pages/panel/components/mis-servicios/sections/FormularioDatosAcademicos.jsx

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
      <p className="text-xs text-neutral-500 mb-3">
        Completa estos datos para que el equipo Inspira pueda ayudarte a
        seleccionar universidades y programas.
      </p>

      <form className="space-y-6" onSubmit={handleSubmitFormulario}>
        {/* 0. Campos que ya tenías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-neutral-700">
              Universidad de origen
            </label>
            <input
              type="text"
              className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
              value={formData.universidad_origen || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  universidad_origen: e.target.value,
                }))
              }
              placeholder="Ej: Universidad Nacional Mayor de San Marcos"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-neutral-700">
              Grado académico
            </label>
            <input
              type="text"
              className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
              value={formData.grado_academico || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  grado_academico: e.target.value,
                }))
              }
              placeholder="Ej: Licenciada en Enfermería"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-neutral-700">
              Carrera / especialidad
            </label>
            <input
              type="text"
              className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs"
              value={formData.carrera || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  carrera: e.target.value,
                }))
              }
              placeholder="Ej: Enfermería pediátrica, salud infantil, etc."
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[11px] font-medium text-neutral-700">
              Universidades de destino (una por línea o separadas por comas)
            </label>
            <textarea
              className="border border-neutral-300 rounded-md px-2 py-1.5 text-xs min-h-[80px]"
              value={formData.universidades_destino || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  universidades_destino: e.target.value,
                }))
              }
              placeholder={
                "Ej:\n- Universidad de Barcelona\n- Universidad de Sevilla\n- Universidad de Granada"
              }
            />
          </div>
        </div>

        <hr className="border-neutral-200" />

        {/* 3.1 Perfil académico cuantitativo */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.1. Perfil académico cuantitativo
          </h4>

          <div className="grid gap-3">
            {/* Promedio Perú */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Promedio ponderado (escala 0–20, Perú)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={formData.promedio_peru || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    promedio_peru: e.target.value.trim(),
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                placeholder="Ej: 15.75"
              />
              <p className="mt-1 text-[10px] text-neutral-500">
                Opcional. Si lo completas, debe estar entre 0 y 20.
              </p>
            </div>

            {/* Otra escala */}
            <div className="border border-neutral-200 rounded-md p-2">
              <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300"
                  checked={!!formData.otra_escala_activa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      otra_escala_activa: e.target.checked,
                    }))
                  }
                />
                <span>También quiero indicar mi promedio en otra escala</span>
              </label>

              {formData.otra_escala_activa && (
                <div className="mt-2 grid gap-2 md:grid-cols-[1fr,180px]">
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                      Promedio (otra escala)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.promedio_otra_escala_valor || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          promedio_otra_escala_valor: e.target.value.trim(),
                        }))
                      }
                      className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                      placeholder="Ej: 8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                      Tipo de escala
                    </label>
                    <select
                      value={formData.promedio_otra_escala_tipo || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          promedio_otra_escala_tipo: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    >
                      <option value="">Selecciona escala</option>
                      <option value="0-10">0–10</option>
                      <option value="0-4">0–4</option>
                      <option value="porcentaje">Porcentaje (0–100)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Ubicación en el grupo */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                ¿Estuviste en tercio, quinto o décimo superior?
              </p>
              <div className="grid gap-1 md:grid-cols-2">
                {[
                  { value: "tercio", label: "Tercio superior" },
                  { value: "quinto", label: "Quinto superior" },
                  { value: "decimo", label: "Décimo superior" },
                  { value: "ninguno", label: "No estuve en ninguno" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-xs text-neutral-800"
                  >
                    <input
                      type="radio"
                      name="ubicacion_grupo"
                      value={opt.value}
                      checked={formData.ubicacion_grupo === opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ubicacion_grupo: e.target.value,
                        }))
                      }
                      className="text-[#023A4B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Otra maestría */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                ¿Cuentas con otra maestría?
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "si", label: "Sí" },
                  { value: "no", label: "No" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 text-xs text-neutral-800"
                  >
                    <input
                      type="radio"
                      name="otra_maestria_tiene"
                      value={opt.value}
                      checked={formData.otra_maestria_tiene === opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          otra_maestria_tiene: e.target.value,
                        }))
                      }
                      className="text-[#023A4B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {formData.otra_maestria_tiene === "si" && (
                <div className="mt-2">
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Nombre de la maestría y universidad
                  </label>
                  <input
                    type="text"
                    value={formData.otra_maestria_detalle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        otra_maestria_detalle: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    placeholder="Ej: Máster en Enfermería Pediátrica – Universidad de Barcelona"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3.2 Experiencia profesional y vinculación */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.2. Experiencia profesional y vinculación
          </h4>

          <div className="grid gap-3">
            {/* Años de experiencia */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Años de experiencia profesional
              </p>
              <div className="grid gap-1 md:grid-cols-2">
                {[
                  { value: "sin", label: "Sin experiencia" },
                  { value: "2-3", label: "2–3 años" },
                  { value: "3-5", label: "3–5 años" },
                  { value: "5-10", label: "5–10 años" },
                  { value: "10+", label: "Más de 10 años" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-xs text-neutral-800"
                  >
                    <input
                      type="radio"
                      name="experiencia_anios"
                      value={opt.value}
                      checked={formData.experiencia_anios === opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          experiencia_anios: e.target.value,
                        }))
                      }
                      className="text-[#023A4B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Vinculación con el máster */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                ¿Tu experiencia está vinculada a los másteres que son de tu interés?
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "si", label: "Sí" },
                  { value: "no", label: "No" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="inline-flex items-center gap-2 text-xs text-neutral-800"
                  >
                    <input
                      type="radio"
                      name="experiencia_vinculada"
                      value={opt.value}
                      checked={formData.experiencia_vinculada === opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          experiencia_vinculada: e.target.value,
                        }))
                      }
                      className="text-[#023A4B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {formData.experiencia_vinculada === "si" && (
                <div className="mt-2">
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Cuéntanos brevemente cómo se relaciona tu experiencia con estos
                    másteres
                  </label>
                  <textarea
                    rows={3}
                    value={formData.experiencia_vinculada_detalle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experiencia_vinculada_detalle: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    placeholder="Describe en 3–4 líneas tu experiencia relevante."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3.3 Investigación y formación complementaria */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.3. Investigación y formación complementaria
          </h4>

          <div className="grid gap-3">
            {/* Investigación */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Investigación
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="investigacion_experiencia"
                    value="si"
                    checked={formData.investigacion_experiencia === "si"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investigacion_experiencia: e.target.value,
                      }))
                    }
                    className="text-[#023A4B]"
                  />
                  <span>
                    Tengo publicaciones o he participado en grupos de investigación
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="investigacion_experiencia"
                    value="no"
                    checked={formData.investigacion_experiencia === "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investigacion_experiencia: e.target.value,
                      }))
                    }
                    className="text-[#023A4B]"
                  />
                  <span>No tengo experiencia en investigación</span>
                </label>
              </div>

              {formData.investigacion_experiencia === "si" && (
                <div className="mt-2">
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Detalla brevemente tus publicaciones o grupos de investigación
                    (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.investigacion_detalle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        investigacion_detalle: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                  />
                </div>
              )}
            </div>

            {/* Formación complementaria */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Formación complementaria relacionada con el máster
              </p>
              <div className="grid gap-1 md:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.formacion_otra_maestria}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        formacion_otra_maestria: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>He cursado otra maestría</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.formacion_diplomados}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        formacion_diplomados: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>
                    Tengo diplomados, cursos o seminarios relacionados con el máster
                    de interés
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.formacion_encuentros}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        formacion_encuentros: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>
                    He participado en encuentros, escuelas de verano o congresos
                    sobre el tema
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.formacion_otros}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        formacion_otros: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Otros (especificar)</span>
                </label>
              </div>

              {formData.formacion_otros && (
                <div className="mt-2">
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Detalle de otros estudios
                  </label>
                  <textarea
                    rows={2}
                    value={formData.formacion_otros_detalle || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        formacion_otros_detalle: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3.4 Idiomas y certificaciones */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.4. Idiomas y certificaciones
          </h4>

          <div className="grid gap-3">
            {/* Situación de inglés */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Situación actual de inglés
              </p>
              <div className="space-y-1">
                <label className="flex items-start gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="ingles_situacion"
                    value="uni"
                    checked={formData.ingles_situacion === "uni"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_situacion: e.target.value,
                      }))
                    }
                    className="mt-0.5 text-[#023A4B]"
                  />
                  <span>
                    Tengo certificación de inglés emitida por mi universidad
                  </span>
                </label>

                {formData.ingles_situacion === "uni" && (
                  <div className="ml-5 mt-1">
                    <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                      Nivel
                    </label>
                    <select
                      value={formData.ingles_uni_nivel || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ingles_uni_nivel: e.target.value,
                        }))
                      }
                      className="w-full max-w-[180px] rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    >
                      <option value="">Selecciona nivel</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                )}

                <label className="flex items-start gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="ingles_situacion"
                    value="intl"
                    checked={formData.ingles_situacion === "intl"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_situacion: e.target.value,
                      }))
                    }
                    className="mt-0.5 text-[#023A4B]"
                  />
                  <span>
                    Tengo certificación internacional (IELTS, TOEFL, Cambridge,
                    etc.)
                  </span>
                </label>

                {formData.ingles_situacion === "intl" && (
                  <div className="ml-5 mt-1 grid gap-2 md:grid-cols-[1fr,1fr]">
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                        Tipo de certificación
                      </label>
                      <select
                        value={formData.ingles_intl_tipo || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ingles_intl_tipo: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                      >
                        <option value="">Selecciona</option>
                        <option value="IELTS">IELTS</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="Cambridge">Cambridge</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                        Puntaje o nivel
                      </label>
                      <input
                        type="text"
                        value={formData.ingles_intl_puntaje || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ingles_intl_puntaje: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                        placeholder="Ej: 6.5, 90, C1"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="ingles_situacion"
                    value="instituto"
                    checked={formData.ingles_situacion === "instituto"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_situacion: e.target.value,
                      }))
                    }
                    className="mt-0.5 text-[#023A4B]"
                  />
                  <span>
                    Tengo inglés de instituto (sin certificación oficial)
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="ingles_situacion"
                    value="sin_cert"
                    checked={formData.ingles_situacion === "sin_cert"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_situacion: e.target.value,
                      }))
                    }
                    className="mt-0.5 text-[#023A4B]"
                  />
                  <span>Sé inglés pero aún no lo he certificado</span>
                </label>

                <label className="flex items-start gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="ingles_situacion"
                    value="no"
                    checked={formData.ingles_situacion === "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ingles_situacion: e.target.value,
                      }))
                    }
                    className="mt-0.5 text-[#023A4B]"
                  />
                  <span>No tengo inglés</span>
                </label>
              </div>
            </div>

            {/* Idioma del máster */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Idioma del máster que prefieres
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.idioma_master_es}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        idioma_master_es: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Solo en español</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.idioma_master_bilingue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        idioma_master_bilingue: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Acepto máster bilingüe (español + inglés)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.idioma_master_ingles}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        idioma_master_ingles: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Acepto máster totalmente en inglés</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 3.5 Becas y ayudas económicas */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.5. Becas y ayudas económicas
          </h4>

          <div className="grid gap-2">
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                ¿Deseas postular a una beca o ayuda económica?
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="beca_desea"
                    value="si"
                    checked={formData.beca_desea === "si"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        beca_desea: e.target.value,
                      }))
                    }
                    className="text-[#023A4B]"
                  />
                  <span>Sí</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="radio"
                    name="beca_desea"
                    value="no"
                    checked={formData.beca_desea === "no"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        beca_desea: e.target.value,
                      }))
                    }
                    className="text-[#023A4B]"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {formData.beca_desea === "si" && (
              <div className="grid gap-1 md:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.beca_completa}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        beca_completa: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Becas completas</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.beca_parcial}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        beca_parcial: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Becas parciales / descuentos</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
                  <input
                    type="checkbox"
                    checked={!!formData.beca_ayuda_uni}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        beca_ayuda_uni: e.target.checked,
                      }))
                    }
                    className="rounded border-neutral-300"
                  />
                  <span>Ayudas de la propia universidad</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 3.6 Preferencias del máster */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.6. Preferencias del máster (duración, prácticas, precio)
          </h4>

          <div className="grid gap-3">
            {/* Duración */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Duración máxima que prefieres para el máster
              </label>
              <select
                value={formData.duracion_preferida || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duracion_preferida: e.target.value,
                  }))
                }
                className="w-full max-w-md rounded-md border border-neutral-300 px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
              >
                <option value="">Selecciona una opción</option>
                <option value="indiferente">Me da igual (1–2 años)</option>
                <option value="1">Máximo 1 año (≈ 60 ECTS)</option>
                <option value="1.5">Máximo 1,5 años</option>
                <option value="2">Máximo 2 años</option>
              </select>
            </div>

            {/* Prácticas */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Prácticas curriculares
              </p>
              <div className="grid gap-1 md:grid-cols-2">
                {[
                  {
                    value: "imprescindible",
                    label:
                      "Es imprescindible que el máster tenga prácticas curriculares",
                  },
                  {
                    value: "deseable",
                    label:
                      "Me gustaría que tenga prácticas, pero no es imprescindible",
                  },
                  {
                    value: "no_importante",
                    label: "No es un criterio importante para mí",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-2 text-xs text-neutral-800"
                  >
                    <input
                      type="radio"
                      name="practicas_preferencia"
                      value={opt.value}
                      checked={formData.practicas_preferencia === opt.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          practicas_preferencia: e.target.value,
                        }))
                      }
                      className="mt-0.5 text-[#023A4B]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Presupuesto */}
            <div>
              <p className="block text-xs font-medium text-neutral-700 mb-1">
                Presupuesto máximo para la matrícula del máster (solo estudios)
              </p>
              <div className="grid gap-2 md:grid-cols-2 max-w-xl">
                <div>
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Desde (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.presupuesto_desde || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        presupuesto_desde: e.target.value.trim(),
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    placeholder="Ej: 3000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                    Hasta (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.presupuesto_hasta || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        presupuesto_hasta: e.target.value.trim(),
                      }))
                    }
                    className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
                    placeholder="Ej: 9000"
                  />
                </div>
              </div>
              <p className="mt-1 text-[10px] text-neutral-500 max-w-xl">
                Este dato es orientativo y nos ayuda a no proponerte másteres fuera
                de tu realidad económica.
              </p>
            </div>
          </div>
        </div>

        {/* 3.7 Comentario especial IA */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-900 mb-2">
            3.7. Comentario especial para IA / asesores
          </h4>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Comentario especial sobre tu caso (opcional)
            </label>
            <textarea
              rows={5}
              value={formData.comentario_especial || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  comentario_especial: e.target.value,
                }))
              }
              className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-[#023A4B]"
              placeholder="Cuéntanos cualquier detalle importante (situación familiar, tiempos, si quieres luego hacer doctorado, si no puedes mudarte de ciudad, etc.). Este comentario también ayudará a la IA a priorizar los másteres para tu informe."
            />
          </div>
        </div>

        {/* Botón guardar */}
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
