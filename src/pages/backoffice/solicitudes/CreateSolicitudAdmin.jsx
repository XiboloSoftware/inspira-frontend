// src/pages/backoffice/solicitudes/CreateSolicitudAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

export default function CreateSolicitudAdmin({ onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id_cliente: "",
    id_tipo_solicitud: "",
    descripcion: "",
  });

  const [clienteSearch, setClienteSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  // lista de sugerencias de clientes según lo que se escribe
  const clienteSugerencias = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase();
    if (!q) return [];
    return clientes
      .filter((c) => {
        const nombre = (c.nombre || "").toLowerCase();
        const email = (c.email_contacto || "").toLowerCase();
        return nombre.includes(q) || email.includes(q);
      })
      .slice(0, 10); // limitar a 10 sugerencias
  }, [clienteSearch, clientes]);

  const tipoSeleccionado = useMemo(
    () =>
      tipos.find(
        (t) => String(t.id_tipo_solicitud) === String(form.id_tipo_solicitud)
      ),
    [tipos, form.id_tipo_solicitud]
  );

  const tituloPreview =
    tipoSeleccionado?.nombre || "Se usará el nombre del tipo de solicitud";

  function handleChangeTipo(e) {
    const { value } = e.target;
    setForm((f) => ({ ...f, id_tipo_solicitud: value }));
  }

  function handleChangeDescripcion(e) {
    const { value } = e.target;
    setForm((f) => ({ ...f, descripcion: value }));
  }

  function handleClienteInput(e) {
    const value = e.target.value;
    setClienteSearch(value);
    setShowSuggestions(true);
    // al escribir, limpiamos la selección previa de id_cliente
    setForm((f) => ({ ...f, id_cliente: "" }));
  }

  function seleccionarCliente(c) {
    setForm((f) => ({ ...f, id_cliente: String(c.id_cliente) }));
    setClienteSearch(
      (c.nombre || "Sin nombre") +
        (c.email_contacto ? ` · ${c.email_contacto}` : "")
    );
    setShowSuggestions(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const id_cliente = Number(form.id_cliente);
    const id_tipo_solicitud = Number(form.id_tipo_solicitud);

    if (!id_cliente) {
      alert("Selecciona un cliente de la lista.");
      return;
    }
    if (!id_tipo_solicitud) {
      alert("Selecciona un tipo de solicitud.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        id_cliente,
        id_tipo_solicitud,
        // no mandamos titulo: el backend lo toma del tipo
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
        descripcion: "",
      });
      setClienteSearch("");
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
      <p className="text-[11px] text-neutral-500 mb-2">
        Selecciona el cliente y el tipo de solicitud. El título se tomará
        automáticamente del tipo elegido.
      </p>

      {loadingOpciones && (
        <p className="text-[11px] text-neutral-500">
          Cargando clientes y tipos…
        </p>
      )}

      {!loadingOpciones && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Cliente con autocompletado */}
            <div className="relative">
              <label className="block mb-1 font-medium text-xs">
                Cliente
              </label>
              <input
                type="text"
                value={clienteSearch}
                onChange={handleClienteInput}
                onFocus={() => setShowSuggestions(true)}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs bg-white"
                placeholder="Escribe nombre o correo del cliente…"
              />
              {/* sugerencias */}
              {showSuggestions && clienteSugerencias.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                  {clienteSugerencias.map((c) => (
                    <button
                      type="button"
                      key={c.id_cliente}
                      onClick={() => seleccionarCliente(c)}
                      className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-neutral-100"
                    >
                      <div className="font-medium">
                        {c.nombre || "Sin nombre"}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {c.email_contacto || "Sin correo"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {form.id_cliente && (
                <p className="mt-1 text-[10px] text-emerald-700">
                  Cliente seleccionado (ID {form.id_cliente})
                </p>
              )}
            </div>

            {/* Tipo de solicitud */}
            <div>
              <label className="block mb-1 font-medium text-xs">
                Tipo de solicitud
              </label>
              <select
                name="id_tipo_solicitud"
                value={form.id_tipo_solicitud}
                onChange={handleChangeTipo}
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
              <p className="mt-1 text-[10px] text-neutral-500">
                Título automático:{" "}
                <span className="font-semibold">{tituloPreview}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-xs">
                Descripción interna (opcional)
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChangeDescripcion}
                className="w-full border border-neutral-300 rounded-md px-2 py-1 text-xs min-h-[60px]"
                placeholder="Notas internas sobre esta solicitud (opcional)…"
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
