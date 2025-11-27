// src/hooks/usePagoServicio.js
import { useState } from "react";
import { apiPOST } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function usePagoServicio() {
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  async function pagarServicio(id_servicio) {
    if (!user) {
      // si no hay sesión → mandas a login
      window.location.href = "/auth/success"; // ajusta a tu ruta de login si es otra
      return;
    }

    if (!id_servicio) {
      console.error("Falta id_servicio");
      return;
    }

    setLoadingId(id_servicio);
    try {
      const res = await apiPOST("/pagos/servicio/preferencia", {
        id_servicio,
      });

      if (res?.ok && res.preferencia?.init_point) {
        window.location.href = res.preferencia.init_point;
      } else {
        console.error("Error al crear preferencia de servicio:", res);
        alert("No se pudo iniciar el pago. Intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el sistema de pagos.");
    } finally {
      setLoadingId(null);
    }
  }

  return { pagarServicio, loadingId };
}
