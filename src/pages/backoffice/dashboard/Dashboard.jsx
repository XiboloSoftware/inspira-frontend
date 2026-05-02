import { useEffect, useState } from "react";
import { boGET } from "../../../services/backofficeApi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    boGET("/backoffice/dashboard/stats")
      .then((data) => { if (data.error) throw new Error(data.error); setStats(data); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-neutral-100 border border-neutral-200 rounded-xl p-4 animate-pulse h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Dashboard</h1>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Error al cargar estadísticas: {error}
      </div>
    </div>
  );

  const { kpis, clientes_por_mes, solicitudes_por_estado, solicitudes_por_tipo, documentos_por_estado, top_clientes } = stats;
  const docsMap = Object.fromEntries(documentos_por_estado.map((d) => [d.estado, d.count]));
  const totalDocs = documentos_por_estado.reduce((s, d) => s + d.count, 0);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-primary">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Leads esta semana"   value={kpis.leads_semana}          sub="últimos 7 días"  accent="teal" />
        <KpiCard title="Clientes activos"    value={kpis.total_clientes}         sub="registrados"     accent="blue" />
        <KpiCard title="Expedientes activos" value={kpis.expedientes_activos}    sub="en curso"        accent="green" />
        <KpiCard title="Docs pendientes"     value={kpis.documentos_pendientes}  sub="sin revisar"     accent="amber" />
      </div>

      {/* Fila 1: clientes por mes + top clientes */}
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
          color="#1D6A4A"
        />
        <TopClientes data={top_clientes || []} />
      </div>

      {/* Fila 2: por estado + por servicio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HorizontalBarChart
          title="Expedientes por estado"
          data={solicitudes_por_estado.slice(0, 8)}
          labelKey="nombre"
          valueKey="count"
          barColor="#1D6A4A"
        />
        <HorizontalBarChart
          title="Expedientes por servicio"
          data={solicitudes_por_tipo.slice(0, 8)}
          labelKey="nombre"
          valueKey="count"
          barColor="#1A3557"
        />
      </div>

      {/* Documentos */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-4">Documentos por estado de revisión</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <DocEstadoBadge label="Pendientes" count={docsMap["SUBIDO"] || 0}   color="amber" />
          <DocEstadoBadge label="Aprobados"  count={docsMap["APROBADO"] || 0} color="green" />
          <DocEstadoBadge label="Observados" count={docsMap["OBSERVADO"] || 0} color="red" />
        </div>
        {totalDocs > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {[
              { estado: "SUBIDO",   color: "bg-amber-400" },
              { estado: "APROBADO", color: "bg-[#1D6A4A]" },
              { estado: "OBSERVADO",color: "bg-red-400" },
            ].map(({ estado, color }) => {
              const count = docsMap[estado] || 0;
              if (!count) return null;
              return (
                <div key={estado} className={`${color} transition-all rounded-full`}
                  style={{ width: `${(count / totalDocs) * 100}%` }} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
const ACCENT = {
  blue:  { top: "border-t-[#1A3557]", num: "text-[#1A3557]" },
  teal:  { top: "border-t-teal-500",  num: "text-teal-700" },
  amber: { top: "border-t-amber-500", num: "text-amber-700" },
  green: { top: "border-t-[#1D6A4A]",num: "text-[#1D6A4A]" },
};

function KpiCard({ title, value, sub, accent = "blue" }) {
  const a = ACCENT[accent] || ACCENT.blue;
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 border-t-4 ${a.top} p-4 shadow-sm`}>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
      <p className={`font-['Fraunces',serif] text-3xl font-bold leading-none ${a.num}`}>{value ?? "—"}</p>
      {sub && <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Vertical Bar Chart ───────────────────────────────────────── */
function VerticalBarChart({ title, subtitle, data, labelKey, valueKey, formatLabel, color = "#1D6A4A" }) {
  const max   = Math.max(...data.map((d) => d[valueKey]), 1);
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
                className="w-full rounded-t transition-all"
                style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.85 }}
                title={`${formatLabel ? formatLabel(d[labelKey]) : d[labelKey]}: ${d[valueKey]}`}
              />
              <span className="text-[9px] text-neutral-400 text-center truncate w-full">
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
function HorizontalBarChart({ title, data, labelKey, valueKey, barColor = "#1D6A4A" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-neutral-700 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">Sin datos</p>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-700 leading-tight pr-2">{d[labelKey]}</span>
                <span className="text-xs font-bold text-neutral-800 shrink-0">{d[valueKey]}</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(d[valueKey] / max) * 100}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Top Clientes ─────────────────────────────────────────────── */
function TopClientes({ data }) {
  const hasEur = data.some((c) => c.total_eur > 0);
  const maxVal = Math.max(...data.map((c) => hasEur ? c.total_eur : c.solicitudes), 1);

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">Top clientes</h3>
        <span className="text-[10px] text-neutral-400">{hasEur ? "por inversión" : "por expedientes"}</span>
      </div>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">Sin datos</p>
      ) : (
        <div className="space-y-3">
          {data.map((c, i) => {
            const val = hasEur ? c.total_eur : c.solicitudes;
            const label = hasEur
              ? `${c.total_eur.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`
              : `${c.solicitudes} exp.`;
            return (
              <div key={c.id_cliente} className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-neutral-300 w-4 shrink-0 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-medium text-neutral-800 truncate">{c.nombre}</p>
                    <span className="text-xs font-bold text-[#1D6A4A] shrink-0 ml-2">{label}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(val / maxVal) * 100}%`, backgroundColor: '#1D6A4A' }}
                    />
                  </div>
                  {hasEur && c.solicitudes > 0 && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">{c.solicitudes} expediente{c.solicitudes > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Doc Estado Badge ─────────────────────────────────────────── */
const DOC_COLORS = {
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-400" },
  green: { bg: "bg-[#E8F5EE]", border: "border-[#1D6A4A]/20", text: "text-[#1D6A4A]", dot: "bg-[#1D6A4A]" },
  red:   { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800",   dot: "bg-red-400" },
};

function DocEstadoBadge({ label, count, color }) {
  const { bg, border, text, dot } = DOC_COLORS[color] || DOC_COLORS.amber;
  return (
    <div className={`${bg} ${border} border rounded-xl p-3 text-center`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${text}`}>{count}</div>
    </div>
  );
}
