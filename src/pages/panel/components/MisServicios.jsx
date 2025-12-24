// src/pages/panel/components/MisServicios.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import ServiciosList from "./mis-servicios/ServiciosList";
import DetalleSolicitud from "./mis-servicios/DetalleSolicitud";
import DetalleSolicitudVisado from "./mis-servicios/DetalleSolicitudVisado";

function esVisado(s) {
  const cod = String(
    s?.tipo_solicitud ||
      s?.tipo ||
      s?.categoria ||
      s?.servicio?.codigo ||
      s?.codigo_servicio ||
      s?.nombre_servicio ||
      ""
  ).toUpperCase();
  return cod.includes("VISADO");
}

export default function MisServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [seleccionadaId, setSeleccionadaId] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("panel_servicio_id");
      return raw ? Number(raw) : null;
    } catch {
      return null;
    }
  });

  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    cargarServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarServicios() {
    setLoading(true);
    setError("");

    try {
      const resp = await apiGET("/solicitudes/mias");
      if (!resp.ok) {
        throw new Error(resp.msg || resp.message || "No se pudieron cargar los servicios");
      }

      const lista = resp.solicitudes || [];
      setServicios(lista);

      if (!seleccionada && seleccionadaId && lista.length) {
        const encontrada = lista.find((s) => Number(s.id_solicitud) === Number(seleccionadaId));
        if (encontrada) setSeleccionada(encontrada);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  function manejarVerDetalle(servicio) {
    setSeleccionada(servicio);
    setSeleccionadaId(servicio.id_solicitud);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("panel_servicio_id", String(servicio.id_solicitud));
      } catch (e) {
        console.error("No se pudo guardar panel_servicio_id", e);
      }
    }
  }

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

  if (seleccionada) {
    return esVisado(seleccionada) ? (
      <DetalleSolicitudVisado solicitudBase={seleccionada} onVolver={manejarVolverLista} />
    ) : (
      <DetalleSolicitud solicitudBase={seleccionada} onVolver={manejarVolverLista} />
    );
  }

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
