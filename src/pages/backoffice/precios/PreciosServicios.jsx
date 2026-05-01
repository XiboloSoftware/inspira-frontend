// src/pages/backoffice/precios/PreciosServicios.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPUT } from "../../../services/backofficeApi";
import ServiciosList from "./ServiciosList";
import ServicioForm from "./ServicioForm";

const ESTADO_FORM_INICIAL = {
  id_servicio: null,
  codigo: "",
  nombre: "",
  descripcion: "",
  moneda: "EUR",
  monto: "",
  activo: true,
};

export default function PreciosServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(ESTADO_FORM_INICIAL);
  const [modo, setModo] = useState("nuevo"); // "nuevo" | "editar"
  const [filtro, setFiltro] = useState("todos"); // activos | inactivos | todos

  const [usuario, setUsuario] = useState(null);
const isAdmin = (usuario?.rol || "").toLowerCase() === "admin";

  // ============================
  // Carga de usuario logueado
  // ============================
  useEffect(() => {
    async function cargarUsuario() {
      try {
        const r = await boGET("/backoffice/me");
        if (r.ok) {
          setUsuario(r.usuario || r.user || null);
        }
      } catch (e) {
        console.error("Error al cargar usuario backoffice", e);
      }
    }
    cargarUsuario();
  }, []);

  // ============================
  // Carga de servicios
  // ============================
  async function cargar() {
    setLoading(true);
    const r = await boGET(`/backoffice/precios/servicios?estado=${filtro}`);
    if (r.ok) setServicios(r.servicios || []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, [filtro]);

  function resetForm() {
    setForm(ESTADO_FORM_INICIAL);
    setModo("nuevo");
  }

  function editarServicio(s) {
    setModo("editar");
    setForm({
      id_servicio: s.id_servicio,
      codigo: s.codigo,
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      moneda: s.precio_actual?.moneda || "EUR",
      monto: s.precio_actual?.monto ?? "",
      activo: s.activo,
    });
  }

  function abrirChecklist(s) {
    alert("Abrir checklist para servicio: " + s.nombre);
    // Más adelante aquí haremos navigate('/backoffice/checklist/' + s.id_servicio)
  }

  // ============================
  // Guardar (solo admin)
  // ============================
  async function guardar(e) {
    e.preventDefault();
    if (saving) return;

    if (!isAdmin) {
      alert("Solo un administrador puede crear o modificar servicios y precios.");
      return;
    }

    setSaving(true);
    try {
      const montoNumber = parseFloat(form.monto);
      if (Number.isNaN(montoNumber)) {
        alert("Monto inválido");
        return;
      }

      if (modo === "nuevo") {
        const r = await boPOST("/backoffice/precios/servicios", {
          codigo: (form.codigo || "").trim(), // puede ir vacío, el backend genera uno
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
          moneda: form.moneda,
          monto: montoNumber,
        });

        if (!r.ok) {
          alert(r.msg || "No se pudo crear el servicio");
        } else {
          resetForm();
          await cargar();
        }
      } else {
        // actualizar servicio
        const r1 = await boPUT(
          `/backoffice/precios/servicios/${form.id_servicio}`,
          {
            nombre: form.nombre.trim(),
            descripcion: form.descripcion.trim(),
            activo: form.activo,
          }
        );

        if (!r1.ok) {
          alert(r1.msg || "No se pudo actualizar el servicio");
          return;
        }

        // actualizar precio (nueva versión)
        const r2 = await boPUT(
          `/backoffice/precios/servicios/${form.id_servicio}/precio`,
          {
            moneda: form.moneda,
            monto: montoNumber,
          }
        );

        if (!r2.ok) {
          alert(r2.msg || "No se pudo actualizar el precio");
          return;
        }

        await cargar();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Precios / Servicios</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Gestiona los servicios y sus precios actuales.</p>
      </div>

      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {[
          { value: "todos", label: "Todos" },
          { value: "activos", label: "Activos" },
          { value: "inactivos", label: "Inactivos" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFiltro(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              filtro === opt.value ? "bg-white text-[#1a5c3a] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de servicios */}
        <div className="lg:col-span-2">
          <ServiciosList
            servicios={servicios}
            loading={loading}
            onEditar={isAdmin ? editarServicio : undefined}
            onChecklist={abrirChecklist}
          />
        </div>

        {/* Formulario lateral */}
        <div>
          {isAdmin ? (
            <ServicioForm
              modo={modo}
              form={form}
              setForm={setForm}
              saving={saving}
              onSubmit={guardar}
              onReset={resetForm}
            />
          ) : (
            <div className="border border-neutral-200 rounded-lg p-4 text-xs text-neutral-600 bg-neutral-50">
              Solo los administradores pueden crear o modificar servicios y
              precios. Como asesor, puedes consultar la lista de servicios en la
              columna izquierda, pero no realizar cambios.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
