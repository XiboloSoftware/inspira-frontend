// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import ServiciosList from "./mis-servicios/ServiciosList";
import DetalleSolicitud from "./mis-servicios/DetalleSolicitud";

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    cargarServicios();
  }, []);

  async function cargarServicios() {
    setLoading(true);
    setError("");
    try {
      const r = await apiGET("/solicitudes/mias");
      if (r.ok) {
        setServicios(r.solicitudes || []);
      } else {
        setError(r.message || r.msg || "No se pudieron cargar tus servicios.");
      }
    } catch (e) {
      console.error(e);
      setError("Error al cargar tus servicios.");
    } finally {
      setLoading(false);
    }
  }

  if (seleccionada) {
    return (
      <DetalleSolicitud
        solicitudBase={seleccionada}
        onVolver={() => setSeleccionada(null)}
      />
    );
  }

  return (
    <ServiciosList
      servicios={servicios}
      loading={loading}
      error={error}
      onRecargar={cargarServicios}
      onVerDetalle={setSeleccionada}
    />
  );
}
