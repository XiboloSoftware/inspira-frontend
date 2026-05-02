// src/pages/backoffice/solicitudes/CreateSolicitudAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import ClienteAutocomplete from "./components/ClienteAutocomplete";

export default function CreateSolicitudAdmin({ onCreated, onCerrar }) {
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ id_cliente: "", id_tipo_solicitud: "", descripcion: "" });
  const [clienteSearch, setClienteSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function cargarOpciones() {
      setLoadingOpciones(true);
      try {
        const r = await boGET("/backoffice/solicitudes/opciones-crear");
        if (r.ok) { setClientes(r.clientes || []); setTipos(r.tipos || []); }
        else setError(r.msg || "No se pudieron cargar las opciones");
      } finally {
        setLoadingOpciones(false);
      }
    }
    cargarOpciones();
  }, []);

  const tipoSeleccionado = useMemo(
    () => tipos.find((t) => String(t.id_tipo_solicitud) === String(form.id_tipo_solicitud)),
    [tipos, form.id_tipo_solicitud]
  );

  function handleClienteInput(e) {
    setClienteSearch(e.target.value);
    setShowSuggestions(true);
    setForm((f) => ({ ...f, id_cliente: "" }));
  }

  function seleccionarCliente(c) {
    setForm((f) => ({ ...f, id_cliente: String(c.id_cliente) }));
    setClienteSearch((c.nombre || "Sin nombre") + (c.email_contacto ? ` · ${c.email_contacto}` : ""));
    setShowSuggestions(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setError("");

    const id_cliente = Number(form.id_cliente);
    const id_tipo_solicitud = Number(form.id_tipo_solicitud);
    if (!id_cliente) { setError("Selecciona un cliente de la lista."); return; }
    if (!id_tipo_solicitud) { setError("Selecciona un tipo de solicitud."); return; }

    setSaving(true);
    try {
      const r = await boPOST("/backoffice/solicitudes", {
        id_cliente, id_tipo_solicitud,
        descripcion: form.descripcion?.trim() || null,
        origen: "backoffice_manual",
      });
      if (!r.ok) { setError(r.msg || "No se pudo crear la solicitud"); return; }
      if (r.solicitud && onCreated) onCreated(r.solicitud);
      setForm({ id_cliente: "", id_tipo_solicitud: "", descripcion: "" });
      setClienteSearch("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white">Nueva solicitud manual</p>
          <p className="text-[11px] text-white/50">El título se asignará automáticamente del tipo elegido</p>
        </div>
        {onCerrar && (
          <button type="button" onClick={onCerrar}
            className="shrink-0 text-white/60 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition">
            ✕ Cerrar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-5">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {loadingOpciones ? (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
              <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
              Cargando opciones…
            </div>
          ) : (
            <>
              {/* Fila: cliente + tipo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Cliente */}
                <ClienteAutocomplete
                  clientes={clientes}
                  value={form.id_cliente}
                  inputValue={clienteSearch}
                  onInput={handleClienteInput}
                  onSelect={seleccionarCliente}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                />

                {/* Tipo de solicitud — chips */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Tipo de solicitud
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {tipos.map((t) => {
                      const sel = String(form.id_tipo_solicitud) === String(t.id_tipo_solicitud);
                      return (
                        <button
                          type="button"
                          key={t.id_tipo_solicitud}
                          onClick={() => setForm((f) => ({ ...f, id_tipo_solicitud: String(t.id_tipo_solicitud) }))}
                          className={`text-left px-2.5 py-2 rounded-lg border transition-all ${
                            sel
                              ? "border-[#1D6A4A] bg-[#E8F5EE] text-[#1D6A4A]"
                              : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          <p className={`text-[11px] leading-snug ${sel ? "font-semibold" : "font-medium"}`}>
                            {t.nombre}
                          </p>
                          <p className={`text-[9px] mt-0.5 ${sel ? "text-[#1D6A4A]/70" : "text-neutral-400"}`}>
                            {t.cantidad_solicitudes > 0 ? `${t.cantidad_solicitudes} solicitudes` : "Sin uso"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {tipoSeleccionado && (
                    <p className="mt-1.5 text-[10px] text-[#1D6A4A] font-medium">
                      ✓ {tipoSeleccionado.nombre}
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                  Descripción interna <span className="font-normal normal-case tracking-normal">(opcional)</span>
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition resize-none"
                  rows={2}
                  placeholder="Notas internas sobre esta solicitud…"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loadingOpciones && (
          <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-end gap-3 bg-neutral-50">
            {onCerrar && (
              <button type="button" onClick={onCerrar}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-white transition">
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !form.id_cliente || !form.id_tipo_solicitud}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition"
            >
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creando…</>
                : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>Crear solicitud</>
              }
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
