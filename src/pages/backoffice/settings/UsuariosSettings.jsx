// src/pages/backoffice/settings/UsuariosSettings.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";
import UsuariosForm from "./components/UsuariosForm";
import UsuariosTable from "./components/UsuariosTable";

export default function UsuariosSettings({ user }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "asesor",
    telefono: "",
    cargo: "",
  });

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/usuarios");
    if (r.ok) setUsuarios(r.usuarios || []);
    setLoading(false);
  }

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "asesor",
      telefono: "",
      cargo: "",
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);

    let r;
    if (editingId) {
      // EDITAR (no tocamos password aquí)
      r = await boPOST(`/backoffice/usuarios/${editingId}`, {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        telefono: form.telefono,
        cargo: form.cargo,
      });
    } else {
      // CREAR
      r = await boPOST("/backoffice/usuarios", form);
    }

    setSaving(false);

    if (!r.ok) {
      alert(
        r.msg ||
          (editingId ? "Error actualizando usuario" : "Error creando usuario")
      );
      return;
    }

    if (editingId) {
      setUsuarios((prev) =>
        prev.map((x) => (x.id_usuario === editingId ? r.usuario : x))
      );
    } else {
      setUsuarios((prev) => [...prev, r.usuario]);
    }

    resetForm();
  }

  function startEdit(u) {
    setEditingId(u.id_usuario);
    setForm({
      nombre: u.nombre || "",
      email: u.email || "",
      password: "", // no se usa para editar
      rol: u.rol || "asesor",
      telefono: u.telefono || "",
      cargo: u.cargo || "",
    });
  }

  async function toggleActivo(u) {
    const r = await boPOST(`/backoffice/usuarios/${u.id_usuario}/estado`, {
      activo: !u.activo,
    });

    if (!r.ok) {
      alert(r.msg || "Error actualizando estado");
      return;
    }

    setUsuarios((prev) =>
      prev.map((x) => (x.id_usuario === u.id_usuario ? r.usuario : x))
    );
  }

  // Bloqueo visual si no es admin (el backend igual lo valida)
  if (!user || user.rol !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Usuarios internos</h1>
        <p className="mt-2 text-neutral-700">
          Solo los usuarios con rol{" "}
          <span className="font-semibold">admin</span> pueden gestionar el
          staff.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Usuarios internos</h1>

      <UsuariosForm
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        saving={saving}
        editingId={editingId}
        onCancelEdit={resetForm}
      />

      <UsuariosTable
        usuarios={usuarios}
        loading={loading}
        onToggleActivo={toggleActivo}
        onEditClick={startEdit}
      />
    </div>
  );
}
