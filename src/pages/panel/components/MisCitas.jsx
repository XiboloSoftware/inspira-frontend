// src/pages/panel/components/citas/MisCitas.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";
import CitaCard from "./CitaCard";
import FiltrosCitas from "./FiltrosCitas";
import PaginacionCitas from "./PaginacionCitas";
import {
  PAGE_SIZE,
  esFechaFutura,
  esCancelada,
} from "./citasUtils";

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtro, setFiltro] = useState("proximas"); // proximas | historial | canceladas
  const [page, setPage] = useState(1);

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    setLoading(true);
    try {
      const r = await apiGET("/diagnostico/mis-citas");
      if (r.ok) {
        setCitas(r.citas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // cuando cambie filtro o citas, volvemos a página 1
  useEffect(() => {
    setPage(1);
  }, [filtro, citas]);

  // clasificación
  const canceladas = citas.filter(esCancelada);
  const noCanceladas = citas.filter((c) => !esCancelada(c));
  const futuras = noCanceladas.filter(esFechaFutura);
  const pasadas = noCanceladas.filter((c) => !esFechaFutura(c));

  let titulo = "";
  let lista = [];

  if (filtro === "proximas") {
    titulo = "Próximas citas";
    lista = futuras;
  } else if (filtro === "historial") {
    titulo = "Historial de citas";
    lista = pasadas;
  } else {
    titulo = "Citas canceladas";
    lista = canceladas;
  }

  const totalItems = lista.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = lista.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <FiltrosCitas
          filtro={filtro}
          onChange={setFiltro}
          totalFuturas={futuras.length}
          totalPasadas={pasadas.length}
          totalCanceladas={canceladas.length}
        />

        {loading && (
          <p className="text-sm text-neutral-500">Cargando tus citas…</p>
        )}

        {!loading && totalItems === 0 && (
          <p className="text-sm text-neutral-500">
            No tienes citas en esta categoría.
          </p>
        )}

        {!loading && totalItems > 0 && (
          <>
            <h2 className="text-sm font-semibold text-neutral-800 mb-3">
              {titulo}
            </h2>

            <div className="space-y-3">
              {pageItems.map((cita) => (
                <CitaCard
                  key={cita.id_pre_reserva}
                  cita={cita}
                />
              ))}
            </div>

            <PaginacionCitas
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              page={currentPage}
              onChangePage={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
