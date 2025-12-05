// src/pages/backoffice/instructivos/InstructivosServicios.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE, boUpload } from "../../../services/backofficeApi";

const FORM_INICIAL = {
  id_instructivo: null,
  label: "",
  descripcion: "",
  archivo_url: "",
  orden: 1,
  activo: true,
};

export default function InstructivosServicios() {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [instructivos, setInstructivos] = useState([]);
  const [loadingInstructivos, setLoadingInstructivos] = useState(false);

  const [form, setForm] = useState(FORM_INICIAL);
  const [modo, setModo] = useState("nuevo"); // "nuevo" | "editar"
  const [saving, setSaving] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  useEffect(() => {
    cargarServicios();
  }, []);

  async function cargarServicios() {
    setLoadingServicios(true);
    const r = await boGET("/backoffice/instructivos/servicios");
    if (r.ok) setServicios(r.servicios || []);
    setLoadingServicios(false);
  }

  async function cargarInstructivos(id_servicio) {
    if (!id_servicio) {
      setInstructivos([]);
      return;
    }
    setLoadingInstructivos(true);
    const r = await boGET(
      `/backoffice/instructivos/servicios/${id_servicio}/instructivos`
    );
    if (r.ok && r.servicio) {
      setInstructivos(r.servicio.instructivos || []);
    } else {
      setInstructivos([]);
    }
    setLoadingInstructivos(false);
  }

  function manejarCambioServicio(e) {
    const val = e.target.value;
    if (!val) {
      setSelectedServicio(null);
      setInstructivos([]);
      resetForm();
      return;
    }
    const id = Number(val);
    setSelectedServicio(id);
    resetForm();
    cargarInstructivos(id);
  }

  function resetForm() {
    setForm(FORM_INICIAL);
    setModo("nuevo");
  }

  function editarInstructivo(inst) {
    setModo("editar");
    setForm({
      id_instructivo: inst.id_instructivo,
      label: inst.label || "",
      descripcion: inst.descripcion || "",
      archivo_url: inst.archivo_url || "",
      orden: inst.orden ?? 1,
      activo: !!inst.activo,
    });
  }

  async function eliminarInstructivo(id_instructivo) {
    if (!window.confirm("¿Eliminar este instructivo? (se desactiva)")) return;
    const r = await boDELETE(`/backoffice/instructivos/${id_instructivo}`);
    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar");
      return;
    }
    if (selectedServicio) {
      cargarInstructivos(selectedServicio);
    }
  }

  async function handleUploadArchivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoArchivo(true);
    try {
      const r = await boUpload("/backoffice/instructivos/upload", file);
      if (!r.ok) {
        alert(r.msg || "No se pudo subir el archivo");
        return;
      }
      setForm((prev) => ({
        ...prev,
        archivo_url: r.ruta_archivo,
      }));
    } finally {
      setSubiendoArchivo(false);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    if (!selectedServicio) {
      alert("Selecciona un servicio primero");
      return;
    }
    if (!form.label.trim()) {
      alert("Falta el nombre del instructivo");
      return;
    }
    if (!form.archivo_url) {
      alert("Sube un archivo primero");
      return;
    }

    setSaving(true);
    try {
      if (modo === "nuevo") {
        const r = await boPOST(
          `/backoffice/instructivos/servicios/${selectedServicio}/instructivos`,
          {
            label: form.label,
            descripcion: form.descripcion,
            archivo_url: form.archivo_url,
            orden: form.orden,
            activo: form.activo,
          }
        );
        if (!r.ok) {
          alert(r.msg || "No se pudo crear");
          return;
        }
      } else {
        const r = await boPUT(
          `/backoffice/instructivos/${form.id_instructivo}`,
          {
            label: form.label,
            descripcion: form.descripcion,
            archivo_url: form.archivo_url,
            orden: form.orden,
            activo: form.activo,
          }
        );
        if (!r.ok) {
          alert(r.msg || "No se pudo actualizar");
          return;
        }
      }

      resetForm();
      if (selectedServicio) {
        cargarInstructivos(selectedServicio);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-primary mb-2">
        Instructivos y plantillas por servicio
      </h1>
      <p className="text-sm text-neutral-600 mb-4">
        Configura los instructivos que verán los clientes en cada servicio.
      </p>

      {/* Selector de servicio */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-4">
        <label className="text-xs text-neutral-500 mb-1 block">
          Selecciona un servicio
        </label>
        <select
          className="border rounded-lg px-2 py-1.5 text-sm w-full max-w-md"
          value={selectedServicio || ""}
          onChange={manejarCambioServicio}
        >
          <option value="">-- Selecciona --</option>
          {servicios.map((s) => (
            <option key={s.id_servicio} value={s.id_servicio}>
              {s.nombre} ({s.codigo}){" "}
              {s.activo ? "" : " - INACTIVO"}{" "}
              {s.cantidad_instructivos_activos
                ? `(${s.cantidad_instructivos_activos} activos)`
                : ""}
            </option>
          ))}
        </select>
        {loadingServicios && (
          <p className="text-xs text-neutral-500 mt-1">Cargando servicios…</p>
        )}
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lista de instructivos */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800">
              Instructivos del servicio
            </h2>
            {loadingInstructivos && (
              <span className="text-xs text-neutral-500">Cargando…</span>
            )}
          </div>

          {(!selectedServicio || instructivos.length === 0) &&
            !loadingInstructivos && (
              <p className="text-sm text-neutral-500">
                {selectedServicio
                  ? "Aún no hay instructivos configurados para este servicio."
                  : "Selecciona un servicio para ver/crear instructivos."}
              </p>
            )}

          <ul className="space-y-2">
            {instructivos.map((inst) => (
              <li
                key={inst.id_instructivo}
                className="border rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <div className="flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {inst.orden}. {inst.label}
                    </span>
                    {!inst.activo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {inst.descripcion && (
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {inst.descripcion}
                    </p>
                  )}
                  {inst.archivo_url && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {inst.archivo_url}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editarInstructivo(inst)}
                    className="px-3 py-1.5 rounded-lg border text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarInstructivo(inst.id_instructivo)}
                    className="px-3 py-1.5 rounded-lg border text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Formulario de creación/edición */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">
            {modo === "nuevo" ? "Nuevo instructivo" : "Editar instructivo"}
          </h2>

          <form className="space-y-3" onSubmit={guardar}>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                Título / Label
              </label>
              <input
                type="text"
                className="border rounded-lg px-2 py-1.5 text-sm w-full"
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                className="border rounded-lg px-2 py-1.5 text-sm w-full"
                rows={3}
                value={form.descripcion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descripcion: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">
                Archivo
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center px-3 py-1.5 text-xs border rounded-lg cursor-pointer hover:bg-neutral-50">
                  {subiendoArchivo ? "Subiendo…" : "Seleccionar archivo"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUploadArchivo}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                </label>
                {form.archivo_url && (
                  <span className="text-[11px] text-green-700">
                    Archivo listo
                  </span>
                )}
              </div>
              {form.archivo_url && (
                <p className="text-[10px] text-neutral-400 mt-1 break-all">
                  {form.archivo_url}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  min={1}
                  className="border rounded-lg px-2 py-1.5 text-sm w-20"
                  value={form.orden}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      orden: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <label className="inline-flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, activo: e.target.checked }))
                  }
                />
                <span className="text-xs text-neutral-700">Activo</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving || subiendoArchivo}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark disabled:opacity-60"
              >
                {modo === "nuevo" ? "Crear instructivo" : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg border text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
