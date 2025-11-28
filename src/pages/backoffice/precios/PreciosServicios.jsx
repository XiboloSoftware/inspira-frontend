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

  async function cargar() {
    setLoading(true);
    const r = await boGET("/backoffice/precios/servicios");
    if (r.ok) setServicios(r.servicios || []);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

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


  async function guardar(e) {
    e.preventDefault();
    if (saving) return;

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
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-primary mb-1">
        Precios / Servicios
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Gestiona los servicios (por ejemplo, la reserva de diagnóstico) y sus
        precios actuales.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de servicios */}
        <div className="lg:col-span-2">
          <ServiciosList
            servicios={servicios}
            loading={loading}
            onEditar={editarServicio}
              onChecklist={abrirChecklist}

          />
        </div>

        {/* Formulario lateral */}
        <div>
          <ServicioForm
            modo={modo}
            form={form}
            setForm={setForm}
            saving={saving}
            onSubmit={guardar}
            onReset={resetForm}
          />
        </div>
      </div>
    </div>
  );
}
