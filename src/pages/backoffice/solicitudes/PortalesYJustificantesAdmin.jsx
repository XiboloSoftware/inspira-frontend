// src/pages/backoffice/solicitudes/PortalesYJustificantesAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPATCH, boPOST } from "../../../services/backofficeApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ESTADOS_TRAMITE = [
  "SIN_INICIAR",
  "PRESENTADA",
  "EN_EVALUACION",
  "ADMITIDA",
  "LISTA_ESPERA",
  "DENEGADA",
  "MATRICULADO",
  "RESUELTO_FAVORABLE",
  "RESUELTO_DESFAVORABLE",
];

const TIPOS_TRAMITE = [
  "NOTA_MEDIA",
  "HOMOLOGACION",
  "POSTULACION_MASTER",
  "MATRICULA",
  "OTRO",
];

const TIPOS_JUSTIFICANTE = [
  "RESGUARDO_POSTULACION",
  "CARTA_ADMISION",
  "COMPROBANTE_PAGO",
  "RESOLUCION_NOTA_MEDIA",
  "OTRO",
];

function SeccionPortales({
  titulo,
  tipoPortal,
  items,
  setItems,
  idSolicitud,
}) {
  const handleChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id_acceso: null,
        tipo_portal: tipoPortal,
        organismo: "",
        tipo_tramite:
          tipoPortal === "MINISTERIO" ? "NOTA_MEDIA" : "POSTULACION_MASTER",
        url_acceso: "",
        usuario_login: "",
        password: "",
        es_credencial_personal_cliente: true,
        mostrar_credencial_al_cliente: false,
        estado_tramite: "SIN_INICIAR",
        master_prioridad: null,
        master_label: "",
        observaciones_internas: "",
        visible_para_cliente: true,
        justificantes: [],
      },
    ]);
    window.alert("Se ha añadido un nuevo portal. Recuerda pulsar Guardar en esa fila.");
  };

  const handleSaveRow = async (idx) => {
    const row = items[idx];
    const method = row.id_acceso ? boPATCH : boPOST;

    const path = row.id_acceso
      ? `/api/portales/admin/solicitudes/${idSolicitud}/accesos/${row.id_acceso}`
      : `/api/portales/admin/solicitudes/${idSolicitud}/accesos`;

    const payload = {
      ...row,
    };

    const r = await method(path, payload);
    if (!r.ok) {
      window.alert(r.msg || "Error guardando portal");
      return;
    }

    setItems((prev) => prev.map((p, i) => (i === idx ? r.acceso : p)));
    window.alert("Portal guardado correctamente.");
  };

  const handleDeleteRow = async (idx) => {
    const row = items[idx];
    if (!row.id_acceso) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      window.alert("Portal eliminado (aún no estaba guardado en base de datos).");
      return;
    }
    if (!window.confirm("¿Eliminar este portal y sus justificantes?")) return;

    const r = await boPATCH(`/api/portales/admin/accesos/${row.id_acceso}`, {
      _method: "DELETE",
    });

    if (!r.ok) {
      window.alert(r.msg || "No se pudo eliminar");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
    window.alert("Portal eliminado correctamente.");
  };

  const handleUploadJustificante = async (
    idx,
    file,
    tipo_justificante,
    visible
  ) => {
    const row = items[idx];
    if (!row.id_acceso) {
      window.alert("Guarda primero el portal antes de subir justificantes.");
      return;
    }

    const token = localStorage.getItem("bo_token");
    if (!token) {
      window.alert("No existe sesión de backoffice.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tipo_justificante", tipo_justificante);
    formData.append("visible_para_cliente", visible ? "true" : "false");

    const resp = await fetch(
      `${API_URL}/api/portales/admin/accesos/${row.id_acceso}/justificantes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    let r;
    try {
      r = await resp.json();
    } catch (e) {
      console.error(e);
      window.alert("Error al procesar la respuesta del servidor.");
      return;
    }

    if (!resp.ok || !r.ok) {
      window.alert(r?.msg || "Error subiendo justificante");
      return;
    }

    setItems((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              justificantes: [...(p.justificantes || []), r.justificante],
            }
          : p
      )
    );

    window.alert("Justificante subido correctamente.");
  };

  return (
    <section className="border border-neutral-200 rounded-lg p-3 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{titulo}</h3>
          <p className="text-xs text-neutral-500">
            Registra portales, claves, estado del trámite y justificantes.
          </p>
        </div>
        <button
          onClick={handleAddRow}
          className="text-xs px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Añadir portal
        </button>
      </div>

      <div className="space-y-4">
        {items.map((row, idx) => (
          <div
            key={row.id_acceso ?? `nuevo-${idx}`}
            className="border border-neutral-200 rounded-md p-3 space-y-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block font-medium mb-1">
                  Organismo / Universidad
                </label>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.organismo || ""}
                  onChange={(e) =>
                    handleChange(idx, "organismo", e.target.value)
                  }
                />
              </div>
              {tipoPortal === "UNIVERSIDAD" && (
                <div>
                  <label className="block font-medium mb-1">
                    Máster (label)
                  </label>
                  <input
                    className="w-full border rounded px-2 py-1 text-xs"
                    value={row.master_label || ""}
                    onChange={(e) =>
                      handleChange(idx, "master_label", e.target.value)
                    }
                  />
                </div>
              )}
              <div>
                <label className="block font-medium mb-1">
                  Tipo de trámite
                </label>
                <select
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.tipo_tramite}
                  onChange={(e) =>
                    handleChange(idx, "tipo_tramite", e.target.value)
                  }
                >
                  {TIPOS_TRAMITE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block font-medium mb-1">URL acceso</label>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.url_acceso || ""}
                  onChange={(e) =>
                    handleChange(idx, "url_acceso", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Usuario</label>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.usuario_login || ""}
                  onChange={(e) =>
                    handleChange(idx, "usuario_login", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Contraseña</label>
                <input
                  type="password"
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.password || ""}
                  onChange={(e) =>
                    handleChange(idx, "password", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs items-end">
              <div>
                <label className="block font-medium mb-1">Estado trámite</label>
                <select
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={row.estado_tramite}
                  onChange={(e) =>
                    handleChange(idx, "estado_tramite", e.target.value)
                  }
                >
                  {ESTADOS_TRAMITE.map((e2) => (
                    <option key={e2} value={e2}>
                      {e2}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={row.es_credencial_personal_cliente}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "es_credencial_personal_cliente",
                        e.target.checked
                      )
                    }
                  />
                  Credencial personal del cliente
                </label>
                <label className="text-xs">
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={row.mostrar_credencial_al_cliente}
                    onChange={(e) =>
                      handleChange(
                        idx,
                        "mostrar_credencial_al_cliente",
                        e.target.checked
                      )
                    }
                  />
                  Mostrar al cliente
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDeleteRow(idx)}
                  className="px-3 py-1 rounded border border-red-300 text-red-600 text-xs"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => handleSaveRow(idx)}
                  className="px-3 py-1 rounded bg-emerald-600 text-white text-xs"
                >
                  Guardar
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1 text-xs">
                Observaciones internas
              </label>
              <textarea
                className="w-full border rounded px-2 py-1 text-xs"
                rows={2}
                value={row.observaciones_internas || ""}
                onChange={(e) =>
                  handleChange(idx, "observaciones_internas", e.target.value)
                }
              />
            </div>

            <div className="border-t border-neutral-200 pt-2 mt-2">
              <p className="text-xs font-semibold mb-1">Justificantes</p>
              <ul className="text-xs space-y-1 mb-2">
                {(row.justificantes || []).map((j) => (
                  <li key={j.id_justificante}>
                    {j.tipo_justificante} – {j.nombre_archivo} (
                    {j.fecha_subida
                      ? new Date(j.fecha_subida).toLocaleDateString()
                      : ""}
                    )
                  </li>
                ))}
              </ul>
              <label className="text-xs flex flex-col gap-1">
                Subir justificante
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const tipo = window.prompt(
                      `Tipo justificante (${TIPOS_JUSTIFICANTE.join(", ")})`,
                      "RESGUARDO_POSTULACION"
                    );
                    if (!tipo) {
                      e.target.value = "";
                      return;
                    }
                    const visible = window.confirm(
                      "¿Marcar justificante como visible para el cliente?"
                    );
                    handleUploadJustificante(idx, file, tipo, visible);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PortalesYJustificantesAdmin({ idSolicitud }) {
  const [ministerios, setMinisterios] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await boGET(`/api/portales/admin/solicitudes/${idSolicitud}`);
        if (!r.ok) return;
        if (cancelled) return;
        setMinisterios(r.ministerios || []);
        setMasters(r.masters || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [idSolicitud]);

  if (loading) {
    return (
      <section className="border border-neutral-200 rounded-lg p-3 mt-4 text-xs">
        Cargando portales y justificantes…
      </section>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-sm font-semibold text-neutral-900">
        7. Portales, claves y justificantes
      </h2>
      <SeccionPortales
        titulo="7.1 Ministerios (nota media y homologación)"
        tipoPortal="MINISTERIO"
        items={ministerios}
        setItems={setMinisterios}
        idSolicitud={idSolicitud}
      />
      <SeccionPortales
        titulo="7.2 Universidades / Portales de máster"
        tipoPortal="UNIVERSIDAD"
        items={masters}
        setItems={setMasters}
        idSolicitud={idSolicitud}
      />
    </div>
  );
}
