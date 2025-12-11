// src/pages/backoffice/clientes/Clientes.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT, boDELETE } from "../../../services/backofficeApi"; // 👈 añade boDELETE
import ClientesTable from "./ClientesTable";
import ClienteForm from "./ClienteForm";
import ServiciosClienteModal from "./ServiciosClienteModal";

const FORM_INICIAL = {
  id_cliente: null,
  nombre: "",
  email_contacto: "",
  telefono: "",
  dni: "",
  pasaporte: "",
  pais_origen: "",
  canal_origen: "",
  activo: true,
};


export default function Clientes({ user }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(FORM_INICIAL);
  const [modo, setModo] = useState("nuevo"); // nuevo | editar

  // 👇 NUEVO: estado para el modal de servicios
  const [clienteServicios, setClienteServicios] = useState(null);

  const isAdmin = user?.rol === "admin";

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar(qParam) {
    setLoading(true);
    const query = qParam ?? q;
    const url = query
      ? `/backoffice/clientes?q=${encodeURIComponent(query)}`
      : `/backoffice/clientes`;

    const r = await boGET(url);
    if (r.ok) {
      setClientes(r.clientes || []);
    }
    setLoading(false);
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    cargar(q);
  }

  function onChangeForm(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function resetForm() {
    setForm(FORM_INICIAL);
    setModo("nuevo");
  }

  function onEditarCliente(c) {
  if (!isAdmin) return;
  setModo("editar");
  setForm({
    id_cliente: c.id_cliente,
    nombre: c.nombre || "",
    email_contacto: c.email_contacto || "",
    telefono: c.telefono || "",
    dni: c.dni || "",
    pasaporte: c.pasaporte || "",
    pais_origen: c.pais_origen || "",
    canal_origen: c.canal_origen || "",
    activo: typeof c.activo === "boolean" ? c.activo : true,
  });
}

  // 👇 NUEVO: abrir modal de servicios
  function onVerServiciosCliente(c) {
    setClienteServicios(c);
  }

  async function onSubmitForm(e) {
  e.preventDefault();
  if (!isAdmin) return;
  setSaving(true);

  const payload = {
    nombre: form.nombre.trim(),
    email_contacto: form.email_contacto.trim(),
    telefono: form.telefono || null,
    dni: form.dni || null,
    pasaporte: form.pasaporte || null,
    pais_origen: form.pais_origen || null,
    canal_origen: form.canal_origen || null,
    activo: !!form.activo,
  };

  let r;
  if (form.id_cliente) {
    r = await boPUT(`/backoffice/clientes/${form.id_cliente}`, payload);
  } else {
    r = await boPOST("/backoffice/clientes", payload);
  }

  setSaving(false);

  if (!r.ok) {
    alert(r.msg || "Error guardando cliente");
    return;
  }

  resetForm();
  cargar();
}



async function handleEliminarCliente(c) {
  if (!isAdmin) return;
  if (
    !window.confirm(
      `¿Seguro que quieres eliminar al cliente "${c.nombre}" (${c.email_contacto})?`
    )
  ) {
    return;
  }

  try {
    const r = await boDELETE(`/backoffice/clientes/${c.id_cliente}`);
    if (!r.ok) {
      alert(r.msg || "No se pudo eliminar el cliente");
      return;
    }
    // quitar de la lista sin recargar todo, opcional:
    setClientes((prev) => prev.filter((x) => x.id_cliente !== c.id_cliente));
    alert("Cliente eliminado correctamente");
  } catch (err) {
    console.error(err);
    alert("Error eliminando cliente");
  }
}





  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Clientes</h1>
          <p className="text-sm text-neutral-600">
            Buscar y gestionar clientes de la plataforma.
          </p>
        </div>

        <form
          onSubmit={onSearchSubmit}
          className="flex items-center gap-2 max-w-md w-full"
        >
          <input
            type="text"
            className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Buscar por nombre, correo, celular o DNI..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm bg-primary text-white rounded-lg"
          >
            Buscar
          </button>
        </form>
      </div>

      <ClientesTable
        clientes={clientes}
        loading={loading}
        onEditar={onEditarCliente}
        onVerServicios={onVerServiciosCliente} 
        onEliminar={handleEliminarCliente}   
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <ClienteForm
          form={form}
          modo={modo}
          onChange={onChangeForm}
          onSubmit={onSubmitForm}
          onCancel={resetForm}
          saving={saving}
        />
      )}

      {/* 👇 NUEVO: render del modal de servicios */}
      {clienteServicios && (
        <ServiciosClienteModal
          cliente={clienteServicios}
          onClose={() => setClienteServicios(null)}
        />
      )}
    </div>
  );
}
