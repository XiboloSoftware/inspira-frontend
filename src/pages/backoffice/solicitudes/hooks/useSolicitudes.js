// Hook de estado y lógica para SolicitudesList
import { useEffect, useMemo, useState } from "react";
import { boGET, boDELETE } from "../../../../services/backofficeApi";

function getBackofficeUser() {
  try {
    const token = localStorage.getItem("bo_token");
    if (!token) return null;
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = decodeURIComponent(atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export { getBackofficeUser };

export function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCliente, setSearchCliente] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / pageSize) || 1, 1), [total, pageSize]);

  async function cargarSolicitudes(opts = {}) {
    const p = opts.page ?? page;
    const ps = opts.pageSize ?? pageSize;
    const q = opts.searchCliente ?? searchCliente;

    setLoading(true);
    const params = new URLSearchParams({ page: p, pageSize: ps });
    if (q.trim()) params.set("q", q.trim());

    const r = await boGET(`/backoffice/solicitudes?${params.toString()}`);
    if (r.ok) {
      setSolicitudes(r.solicitudes || []);
      setTotal(r.pagination?.total || 0);
      setPage(r.pagination?.page || p);
      setPageSize(r.pagination?.pageSize || ps);
    }
    setLoading(false);
  }

  useEffect(() => { cargarSolicitudes({ page: 1 }); }, []);

  async function eliminarSolicitud(id_solicitud) {
    const r = await boDELETE(`/backoffice/solicitudes/${id_solicitud}`);
    if (!r.ok) { alert(r.msg || "No se pudo eliminar la solicitud"); return; }
    const newPage = solicitudes.length === 1 && page > 1 ? page - 1 : page;
    cargarSolicitudes({ page: newPage });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    cargarSolicitudes({ page: 1, searchCliente });
  }

  function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    cargarSolicitudes({ page: newPage });
  }

  return {
    solicitudes, loading,
    searchCliente, setSearchCliente,
    page, pageSize, total, totalPages,
    cargarSolicitudes, eliminarSolicitud,
    handleSearchSubmit, changePage,
  };
}
