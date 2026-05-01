import { useEffect, useMemo, useState } from "react";
import { boGET, boPATCH } from "../../../../../services/backofficeApi";

export function usePapelera({ activo }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / pageSize) || 1, 1), [total, pageSize]);

  async function cargar(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: p, pageSize });
    const r = await boGET(`/backoffice/solicitudes/eliminadas?${params}`);
    if (r.ok) {
      setSolicitudes(r.solicitudes || []);
      setTotal(r.pagination?.total || 0);
      setPage(r.pagination?.page || p);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (activo) cargar(1);
  }, [activo]);

  async function restaurar(id_solicitud) {
    if (!window.confirm("¿Restaurar esta solicitud?")) return;
    const r = await boPATCH(`/backoffice/solicitudes/${id_solicitud}/restaurar`, {});
    if (!r.ok) { alert(r.msg || "No se pudo restaurar"); return; }
    cargar(page);
  }

  function changePage(p) {
    if (p < 1 || p > totalPages) return;
    cargar(p);
  }

  return { solicitudes, loading, page, pageSize, total, totalPages, restaurar, changePage };
}
