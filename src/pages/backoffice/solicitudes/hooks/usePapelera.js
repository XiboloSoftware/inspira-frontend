import { useEffect, useMemo, useState } from "react";
import { boGET, boPATCH, boDELETE } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

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
    if (!await dialog.confirm("¿Restaurar esta solicitud?")) return;
    const r = await boPATCH(`/backoffice/solicitudes/${id_solicitud}/restaurar`, {});
    if (!r.ok) { dialog.toast(r.msg || "No se pudo restaurar", "error"); return; }
    cargar(page);
  }

  async function purgar(id_solicitud) {
    if (!await dialog.confirm("¿Eliminar PERMANENTEMENTE esta solicitud? Esta acción no se puede deshacer.")) return;
    const r = await boDELETE(`/backoffice/solicitudes/${id_solicitud}/purgar`);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo purgar", "error"); return; }
    cargar(page);
  }

  function changePage(p) {
    if (p < 1 || p > totalPages) return;
    cargar(p);
  }

  return { solicitudes, loading, page, pageSize, total, totalPages, restaurar, purgar, changePage };
}
