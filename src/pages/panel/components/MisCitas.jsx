// src/pages/panel/components/MisCitas.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../../services/api";

const PAGE_SIZE = 7;

function esFechaFutura(cita) {
  if (!cita.fecha || !cita.hora_inicio) return false;
  const [h, m] = cita.hora_inicio.split(":").map(Number);
  const [y, mo, d] = cita.fecha.split("-").map(Number); // YYYY-MM-DD
  const dt = new Date(y, mo - 1, d, h || 0, m || 0, 0, 0);
  return dt.getTime() > Date.now();
}

function esCancelada(cita) {
  if (!cita.estado) return false;
  return cita.estado.toLowerCase().includes("cancel");
}

function getEstadoConfig(estadoRaw) {
  const estado = (estadoRaw || "").toLowerCase();

  if (estado.includes("pend")) {
    return {
      label: "Pendiente de pago",
      className: "bg-amber-100 text-amber-700",
    };
  }

  if (estado.includes("pag")) {
    return {
      label: "Pagado",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (estado.includes("cancel")) {
    return {
      label: "Cancelado",
      className: "bg-rose-100 text-rose-700",
    };
  }

  if (estado.includes("expir")) {
    return {
      label: "Expirada",
      className: "bg-neutral-200 text-neutral-700",
    };
  }

  return {
    label: estadoRaw || "Sin estado",
    className: "bg-neutral-100 text-neutral-700",
  };
}

function CitaCard({ cita }) {
  const { label, className } = getEstadoConfig(cita.estado);

  const fechaTexto = cita.fecha
    ? new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";

  const rangoHora =
    cita.hora_inicio && cita.hora_fin
      ? `${cita.hora_inicio.slice(0, 5)} – ${cita.hora_fin.slice(0, 5)}`
      : cita.hora_inicio
      ? cita.hora_inicio.slice(0, 5)
      : "";

  const importe =
    typeof cita.monto === "number"
      ? cita.monto.toFixed(2)
      : cita.monto ?? "0.00";

  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-neutral-900">
          {fechaTexto}
          {rangoHora && ` · ${rangoHora}`}
        </p>
        <p className="text-xs text-neutral-600">
          Diagnóstico de inmigración
        </p>
      </div>

      <div className="text-right text-xs space-y-1">
        <span
          className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full font-medium ${className}`}
        >
          {label}
        </span>
        <p className="text-neutral-700">Importe: {importe} {cita.moneda}</p>

        {cita.enlace_meet && !esCancelada(cita) && (
          <a
            href={cita.enlace_meet}
            target="_blank"
            rel="noreferrer"
            className="inline-flex px-3 py-1 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            Entrar a la reunión
          </a>
        )}
      </div>
    </div>
  );
}

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

  // Cuando cambie el filtro, reseteamos a la página 1
  useEffect(() => {
    setPage(1);
  }, [filtro, citas]);

  // Clasificación
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

  const totalPages = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = lista.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        {/* Filtros */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="inline-flex rounded-full bg-neutral-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setFiltro("proximas")}
              className={`px-3 py-1 rounded-full ${
                filtro === "proximas"
                  ? "bg-white shadow text-primary font-semibold"
                  : "text-neutral-600"
              }`}
            >
              Próximas ({futuras.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("historial")}
              className={`px-3 py-1 rounded-full ${
                filtro === "historial"
                  ? "bg-white shadow text-primary font-semibold"
                  : "text-neutral-600"
              }`}
            >
              Historial ({pasadas.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("canceladas")}
              className={`px-3 py-1 rounded-full ${
                filtro === "canceladas"
                  ? "bg-white shadow text-primary font-semibold"
                  : "text-neutral-600"
              }`}
            >
              Canceladas ({canceladas.length})
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-neutral-500">Cargando tus citas…</p>
        )}

        {!loading && lista.length === 0 && (
          <p className="text-sm text-neutral-500">
            No tienes citas en esta categoría.
          </p>
        )}

        {!loading && lista.length > 0 && (
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs text-neutral-600">
                <span>
                  Mostrando{" "}
                  {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, lista.length)}{" "}
                  de {lista.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-2 py-1 rounded border ${
                      currentPage === 1
                        ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={`px-2 py-1 rounded border ${
                      currentPage === totalPages
                        ? "border-neutral-200 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
