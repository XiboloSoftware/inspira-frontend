// src/components/servicios/useContratarServicio.js
import { useState } from "react";
import { apiPOST } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export function useContratarServicio() {
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  async function contratar(serviceId) {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    setLoadingId(serviceId);

    try {
      const r = await apiPOST("/pagos/crear-preferencia", {
        id_servicio: serviceId,
      });
      if (r?.init_point) {
        window.location.href = r.init_point;
      }
    } finally {
      setLoadingId(null);
    }
  }

  return { contratar, loadingId };
}
