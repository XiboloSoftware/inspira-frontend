import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";


export function useBloques(fecha) {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!fecha) return;
    async function load() {
      setLoading(true);
      const r = await apiGET(`/diagnostico/disponibilidad?fecha=${fecha}`);
      setBloques(r.ok ? r.bloques : []);
      setLoading(false);
    }
    load();
  }, [fecha]);

  let libres = bloques.filter((b) => b.estado === "libre");

  if (fecha === today) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    libres = libres.filter((b) => {
      const [h, m] = b.hora_inicio.split(":").map(Number);
      return h * 60 + m > nowMin;
    });
  }

  return { libres, loading, today };
}
