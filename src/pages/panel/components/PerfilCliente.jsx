// src/pages/panel/components/PerfilCliente.jsx
import { useEffect, useState } from "react";
import { apiPATCH } from "../../../services/api";

export default function PerfilCliente({ user, onUserUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email_contacto: "",
    telefono: "",
    dni: "",
    pasaporte: "",
    pais_origen: "",
    canal_origen: "",
    fecha_registro: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      nombre: user.nombre || "",
      email_contacto: user.email_contacto || user.email || "",
      telefono: user.telefono || "",
      dni: user.dni || "",
      pasaporte: user.pasaporte || "",
      pais_origen: user.pais_origen || "",
      canal_origen: user.canal_origen || "",
      fecha_registro: user.fecha_registro || "",
    });
  }, [user]);

  if (!user) {
    return <p>Cargando datos...</p>;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOkMessage("");

    try {
      const body = {
        nombre: form.nombre,
        telefono: form.telefono,
        dni: form.dni,
        pasaporte: form.pasaporte,
        pais_origen: form.pais_origen,
      };

      const r = await apiPATCH("/cliente/me", body);

      if (!r.ok) {
        setError(r.message || "Error al guardar los datos.");
        return;
      }

      const actualizado = r.cliente || { ...user, ...body };
      if (onUserUpdated) {
        onUserUpdated(actualizado);
      }

      setOkMessage("Datos guardados correctamente.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  }

  // Vista solo lectura
  if (!editMode) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-2 text-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-neutral-800">Datos personales</h2>
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            Editar datos
          </button>
        </div>

        <p>
          <strong>Nombre:</strong> {user.nombre || "-"}
        </p>
        <p>
          <strong>Email:</strong> {user.email_contacto || user.email || "-"}
        </p>
        {user.telefono && (
          <p>
            <strong>Teléfono:</strong> {user.telefono}
          </p>
        )}
        {user.dni && (
          <p>
            <strong>DNI:</strong> {user.dni}
          </p>
        )}
        {user.pasaporte && (
          <p>
            <strong>Pasaporte:</strong> {user.pasaporte}
          </p>
        )}
        {user.pais_origen && (
          <p>
            <strong>País de origen:</strong> {user.pais_origen}
          </p>
        )}
        {user.canal_origen && (
          <p>
            <strong>Canal de origen:</strong> {user.canal_origen}
          </p>
        )}
        {user.fecha_registro && (
          <p>
            <strong>Registrado el:</strong>{" "}
            {new Date(user.fecha_registro).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  // Modo edición
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm text-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-neutral-800">Editar datos personales</h2>
        <button
          type="button"
          onClick={() => {
            setEditMode(false);
            setError("");
            setOkMessage("");
          }}
          className="text-xs px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
        >
          Cancelar
        </button>
      </div>

      {error && (
        <p className="mb-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {okMessage && (
        <p className="mb-2 text-xs text-green-600">
          {okMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Email (no editable desde el panel)
          </label>
          <input
            type="email"
            name="email_contacto"
            value={form.email_contacto}
            disabled
            className="w-full border border-neutral-200 bg-neutral-50 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              DNI / Documento nacional
            </label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Pasaporte
            </label>
            <input
              type="text"
              name="pasaporte"
              value={form.pasaporte}
              onChange={handleChange}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            País de origen
          </label>
          <input
            type="text"
            name="pais_origen"
            value={form.pais_origen}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setError("");
              setOkMessage("");
            }}
            className="px-4 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs bg-primary text-white rounded-lg disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
