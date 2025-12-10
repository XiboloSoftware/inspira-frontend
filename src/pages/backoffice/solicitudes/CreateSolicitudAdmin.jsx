// src/pages/backoffice/solicitudes/CreateSolicitudAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

export default function CreateSolicitudAdmin({ onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id_cliente: "",
    id_tipo_solicitud: "",
    titulo: "",
    descripcion: "",
  });

  async function cargarOpciones() {
    setLoadingOpciones(true);
    try {
      const r = await boGET("/backoffice/solicitudes/opciones-crear");
      if (r.ok) {
        setClientes(r.clientes || []);
        setTipos(r.tipos || []);
      } else {
        alert(r.msg || "No se pudieron cargar las opciones");
      }
    } finally {
      setLoadingOpciones(false);
    }
  }

  useEffect(() => {
    cargarOpciones();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      // si cambia el tipo y no hay título, rellenamos automáticamente
      if (name === "id_tipo_solicitud") {
        const tipo = tipos.find(
          (t) => String(t.id_tipo_solicitud) === value
        );
        const tituloAuto =
          f.titulo?.trim() || tipo?.nombre || "Solicitud sin título";
        return { ...f, [name]: value, titulo: tituloAuto };
      }
      return { ...f, [name]: value };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const id_cliente = Number(form.id_cliente);
    const id_tipo_solicitud = Number(form.id_tipo_solicitud);

    if (!id_cliente || !id_tipo_solicitud) {
      alert("Selecciona cliente y tipo de solicitud.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        id_cliente,
        id_tipo_solicitud,
        titulo: form.titulo?.trim() || null,
        descripcion: form.descripcion?.trim() || null,
        origen: "backoffice_manual",
      };

      const r = await boPOST("/backoffice/solicitudes", body);
      if (!r.ok) {
        alert(r.msg || "No se pudo crear la solicitud");
        return;
      }

      if (r.solicitud && onCreated) {
        onCreated(r.solicitud);
      }

      setForm({
        id_cliente: "",
        id_tipo_solicitud: "",
        titulo: "",
        descripcion: "",
      });
      alert("Solicitud creada correctamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 bg-white border border-neutral-200 rounded-xl shadow-sm p-4 text-xs space-y-3"
    >
      <p className="text-sm font-semibold text-neutral-800 mb-1">
        Crear solicitud manual
      </p>
      <p className="text-[11px] text-neutral-500">
        Crea una solicitud sin pasar por el pago. El título se rellenará
        automáticamente según el tipo seleccionado (puedes editarlo).
      </p>

      {loadingOpciones && (
        <p className="text-[11px] text-neutral-500">
          Cargando clientes y tipos…
        </p>
      )}

      {!loadingOpciones && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium text-xs">
                Cliente
              </label>
              <select
                name="id_cliente"
                value={form.id_cliente}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs bg-white"
                required
              >
                <option value="">Selecciona un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {(c.nombre || "Sin nombre") +
                      (c.email_contacto ? ` · ${c.email_contacto}` : "")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-xs">
                Tipo de solicitud
              </label>
              <select
                name="id_tipo_solicitud"
                value={form.id_tipo_solicitud}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs bg-white"
                required
              >
                <option value="">Selecciona un tipo…</option>
                {tipos.map((t) => (
                  <option
                    key={t.id_tipo_solicitud}
                    value={t.id_tipo_solicitud}
                  >
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium text-xs">Título</label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                placeholder="Se rellenará con el tipo, puedes editarlo…"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-xs">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="text-[11px] px-3 py-1.5 rounded-md bg-[#023A4B] text-white hover:bg-[#054256] disabled:opacity-60"
            >
              {saving ? "Creando…" : "Crear solicitud"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
