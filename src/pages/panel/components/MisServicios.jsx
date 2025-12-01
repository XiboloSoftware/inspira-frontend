// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import ServiciosList from "./mis-servicios/ServiciosList";
import DetalleSolicitud from "./mis-servicios/DetalleSolicitud";

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // id de la solicitud previa (si existe en localStorage)
  const [seleccionadaId, setSeleccionadaId] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("panel_servicio_id");
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });

  // objeto completo de la solicitud seleccionada actualmente
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    cargarServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarServicios() {
    setLoading(true);
    setError("");

    try {
      const resp = await apiGET("/panel/mis-servicios"); // tu endpoint
      if (!resp.ok) {
        throw new Error(resp.msg || "No se pudieron cargar los servicios");
      }

      const lista = resp.servicios || resp.data || [];
      setServicios(lista);

      // si había un id guardado, busca esa solicitud y selecciónala
      if (!seleccionada && seleccionadaId && lista.length) {
        const encontrada = lista.find(
          (s) => Number(s.id_solicitud) === Number(seleccionadaId)
        );
        if (encontrada) {
          setSeleccionada(encontrada);
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  // c) Al hacer click en “ver detalle”, guardar el id en estado + localStorage
  function manejarVerDetalle(servicio) {
    setSeleccionada(servicio);
    setSeleccionadaId(servicio.id_solicitud);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "panel_servicio_id",
          String(servicio.id_solicitud)
        );
      } catch (e) {
        console.error("No se pudo guardar panel_servicio_id", e);
      }
    }
  }

  // cuando el usuario vuelve a la lista, limpiamos selección y localStorage
  function manejarVolverLista() {
    setSeleccionada(null);
    setSeleccionadaId(null);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("panel_servicio_id");
      } catch (e) {
        console.error("No se pudo borrar panel_servicio_id", e);
      }
    }
  }

  // Si hay una solicitud seleccionada, mostramos el detalle
  if (seleccionada) {
    return (
      <DetalleSolicitud
        solicitudBase={seleccionada}
        onVolver={manejarVolverLista}
      />
    );
  }

  // Si no hay seleccionada, mostramos la lista
  return (
    <ServiciosList
      servicios={servicios}
      loading={loading}
      error={error}
      onRecargar={cargarServicios}
      onVerDetalle={manejarVerDetalle}
    />
  );
}
