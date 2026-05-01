import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    boGET("/backoffice/dashboard/stats")
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-5">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-secondary-light border border-neutral-200 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 h-52 animate-pulse">
              <div className="h-3 bg-neutral-100 rounded w-1/2 mb-4" />
              <div className="flex items-end gap-2 h-32">
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="flex-1 bg-neutral-100 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl font-bold text-primary mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error al cargar estadísticas: {error}
        </div>
      </div>
    );
  }

  const { kpis, clientes_por_mes, solicitudes_por_estado, solicitudes_por_tipo, documentos_por_estado } = stats;

  const docsMap = Object.fromEntries(documentos_por_estado.map((d) => [d.estado, d.count]));

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-primary">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KpiCard title="Leads esta semana" value={kpis.leads_semana} sub="últimos 7 días" accent="teal" />
        <KpiCard title="Docs pendientes" value={kpis.documentos_pendientes} sub="sin revisar" accent="amber" />
        <KpiCard title="Expedientes activos" value={kpis.expedientes_activos} sub="en curso" accent="violet" />
      </div>

      {/* Gráficos fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VerticalBarChart
          title="Clientes nuevos"
          subtitle="Últimos 6 meses"
          data={clientes_por_mes}
          labelKey="mes"
          valueKey="count"
          formatLabel={(m) => {
            const [y, mo] = m.split("-");
            return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("es-ES", { month: "short" });
          }}
          color="bg-teal-500"
        />
      </div>

      {/* Gráficos fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          title="Expedientes por estado"
          data={solicitudes_por_estado.slice(0, 7)}
          labelKey="nombre"
          valueKey="count"
        />
        <HorizontalBarChart
          title="Expedientes por servicio"
          data={solicitudes_por_tipo.slice(0, 7)}
          labelKey="nombre"
          valueKey="count"
          colorClass="bg-violet-500"
        />
      </div>

      {/* Documentos por estado */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Documentos por estado de revisión</h3>
        <div className="grid grid-cols-3 gap-4">
          <DocEstadoBadge label="Pendientes" count={docsMap["SUBIDO"] || 0} color="amber" />
          <DocEstadoBadge label="Aprobados" count={docsMap["APROBADO"] || 0} color="green" />
          <DocEstadoBadge label="Observados" count={docsMap["OBSERVADO"] || 0} color="red" />
        </div>
        {documentos_por_estado.length > 0 && (
          <div className="mt-4 flex gap-2 h-3 rounded-full overflow-hidden">
            {[
              { estado: "SUBIDO", color: "bg-amber-400" },
              { estado: "APROBADO", color: "bg-green-500" },
              { estado: "OBSERVADO", color: "bg-red-400" },
            ].map(({ estado, color }) => {
              const total = documentos_por_estado.reduce((s, d) => s + d.count, 0);
              const count = docsMap[estado] || 0;
              return total > 0 ? (
                <div
                  key={estado}
                  className={`${color} transition-all`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
const ACCENT = {
  blue:   "border-t-blue-500",
  teal:   "border-t-teal-500",
  amber:  "border-t-amber-500",
  violet: "border-t-violet-500",
};

function KpiCard({ title, value, sub, accent = "blue" }) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 border-t-4 ${ACCENT[accent] || ACCENT.blue} p-4 shadow-sm`}>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="font-['Fraunces'] text-3xl font-bold text-[#0d3320] leading-none">{value ?? "—"}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Vertical Bar Chart ───────────────────────────────────────── */
function VerticalBarChart({ title, subtitle, data, labelKey, valueKey, formatLabel, color = "bg-primary" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const total = data.reduce((s, d) => s + d[valueKey], 0);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
          <p className="text-xs text-neutral-400">{subtitle}</p>
        </div>
        <span className="text-lg font-bold text-neutral-800">{total}</span>
      </div>
      <div className="flex items-end gap-1.5 h-36">
        {data.map((d, i) => {
          const pct = Math.max((d[valueKey] / max) * 100, d[valueKey] > 0 ? 6 : 2);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {d[valueKey] > 0 && (
                <span className="text-[10px] font-semibold text-neutral-600">{d[valueKey]}</span>
              )}
              <div
                className={`w-full ${color} rounded-t transition-all opacity-80 hover:opacity-100`}
                style={{ height: `${pct}%` }}
                title={`${formatLabel ? formatLabel(d[labelKey]) : d[labelKey]}: ${d[valueKey]}`}
              />
              <span className="text-[9px] text-neutral-400 text-center leading-tight truncate w-full text-center">
                {formatLabel ? formatLabel(d[labelKey]) : d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Horizontal Bar Chart ─────────────────────────────────────── */
function HorizontalBarChart({ title, data, labelKey, valueKey, colorClass = "bg-primary" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-neutral-700 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">Sin datos</p>
      ) : (
        <div className="space-y-2.5">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 w-32 shrink-0 truncate" title={d[labelKey]}>
                {d[labelKey]}
              </span>
              <div className="flex-1 bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full transition-all opacity-80`}
                  style={{ width: `${(d[valueKey] / max) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-neutral-700 w-6 text-right shrink-0">
                {d[valueKey]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Doc Estado Badge ─────────────────────────────────────────── */
const DOC_COLORS = {
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-400" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", dot: "bg-green-500" },
  red:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800",   dot: "bg-red-400" },
};

function DocEstadoBadge({ label, count, color }) {
  const { bg, border, text, dot } = DOC_COLORS[color] || DOC_COLORS.amber;
  return (
    <div className={`${bg} ${border} border rounded-lg p-3 text-center`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${text}`}>{count}</div>
    </div>
  );
}
