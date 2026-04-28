import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

const DAYS_OPTIONS = [
  { label: "Hoy + 7 días", value: 7 },
  { label: "14 días", value: 14 },
  { label: "30 días", value: 30 },
];

export default function Agenda() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [cancelling, setCancelling] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); // { uuid, name }
  const [cancelReason, setCancelReason] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  function load(d = days) {
    setLoading(true);
    setError(null);
    boGET(`/backoffice/calendly/events?days=${d}`)
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(days); }, [days]);

  async function handleCancel() {
    if (!cancelModal) return;
    setCancelling(cancelModal.uuid);
    try {
      const res = await boPOST(`/backoffice/calendly/events/${cancelModal.uuid}/cancel`, {
        reason: cancelReason || "Cancelado por el equipo de Inspira Legal",
      });
      if (res.error) throw new Error(res.error);
      setCancelModal(null);
      setCancelReason("");
      load(days);
    } catch (err) {
      alert("Error al cancelar: " + err.message);
    } finally {
      setCancelling(null);
    }
  }

  function copyLink() {
    if (!data?.booking_url) return;
    navigator.clipboard.writeText(data.booking_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Agrupar eventos por día
  const grouped = groupByDay(data?.events || []);
  const todayKey = toDateKey(new Date());

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Agenda</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Reuniones sincronizadas desde Calendly</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro días */}
          <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs">
            {DAYS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 transition-colors ${
                  days === opt.value
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Link de reserva */}
          {data?.booking_url && (
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                copied
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary"
              }`}
            >
              {copied ? "✓ Copiado" : "Copiar link de reserva"}
            </button>
          )}
          <button
            onClick={() => load(days)}
            className="px-3 py-1.5 rounded-lg text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Error: {error}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState bookingUrl={data?.booking_url} onCopy={copyLink} copied={copied} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, events]) => (
            <DaySection
              key={dateKey}
              dateKey={dateKey}
              isToday={dateKey === todayKey}
              events={events}
              onCancel={(uuid, name) => { setCancelModal({ uuid, name }); setCancelReason(""); }}
            />
          ))}
        </div>
      )}

      {/* Modal cancelar */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-semibold text-neutral-800 mb-1">Cancelar reunión</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Se cancelará: <span className="font-medium text-neutral-700">{cancelModal.name}</span>
            </p>
            <textarea
              className="w-full border border-neutral-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
              rows={3}
              placeholder="Motivo de cancelación (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setCancelModal(null)}
                className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200"
              >
                Cerrar
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling === cancelModal.uuid}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling === cancelModal.uuid ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Day Section ──────────────────────────────────────────────── */
function DaySection({ dateKey, isToday, events, onCancel }) {
  const date = new Date(dateKey + "T12:00:00");
  const label = isToday
    ? "Hoy"
    : date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
            isToday
              ? "bg-primary text-white"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {label}
        </div>
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">{events.length} reunión{events.length !== 1 ? "es" : ""}</span>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <EventCard key={event.uuid} event={event} onCancel={onCancel} />
        ))}
      </div>
    </div>
  );
}

/* ── Event Card ───────────────────────────────────────────────── */
function EventCard({ event, onCancel }) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const isPast = end < new Date();
  const invitee = event.invitees?.[0];

  const timeStr = `${start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  const duration = Math.round((end - start) / 60000);

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex flex-col sm:flex-row gap-4 ${
        isPast ? "border-neutral-100 opacity-60" : "border-neutral-200 hover:border-primary/30 transition-colors"
      }`}
    >
      {/* Hora */}
      <div className="flex-shrink-0 w-28 text-center sm:text-left">
        <div className="text-lg font-bold text-primary leading-tight">
          {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="text-xs text-neutral-400">{duration} min</div>
        <StatusBadge status={event.status} past={isPast} />
      </div>

      {/* Info cliente */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-neutral-800">
          {invitee?.name || "Sin datos del cliente"}
        </div>
        {invitee?.email && (
          <div className="text-xs text-neutral-500 mt-0.5">{invitee.email}</div>
        )}
        {invitee?.phone && (
          <div className="text-xs text-neutral-500">{invitee.phone}</div>
        )}
        {invitee?.notes && (
          <div className="mt-2 text-xs text-neutral-600 bg-neutral-50 rounded-lg p-2 border border-neutral-100">
            {invitee.notes}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex sm:flex-col gap-2 flex-wrap items-start sm:items-end justify-end flex-shrink-0">
        {event.location && !isPast && (
          <a
            href={event.location}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 10l4.553-2.776A1 1 0 0121 8.175v7.65a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Unirse
          </a>
        )}
        {invitee?.reschedule_url && !isPast && (
          <a
            href={invitee.reschedule_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg text-xs hover:border-neutral-300 transition-colors"
          >
            Reprogramar
          </a>
        )}
        {!isPast && event.status === "active" && (
          <button
            onClick={() => onCancel(event.uuid, invitee?.name || event.name)}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status, past }) {
  if (past) return <span className="text-[10px] text-neutral-400 mt-1 block">Completada</span>;
  if (status === "canceled") return <span className="text-[10px] text-red-400 mt-1 block">Cancelada</span>;
  return <span className="text-[10px] text-green-600 mt-1 block">Confirmada</span>;
}

/* ── Empty State ──────────────────────────────────────────────── */
function EmptyState({ bookingUrl, onCopy, copied }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center">
      <div className="text-4xl mb-3">📅</div>
      <div className="text-base font-semibold text-neutral-700 mb-1">No hay reuniones programadas</div>
      <div className="text-sm text-neutral-400 mb-5">Para este período no tienes citas agendadas.</div>
      {bookingUrl && (
        <button
          onClick={onCopy}
          className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            copied
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-primary text-white border-primary hover:opacity-90"
          }`}
        >
          {copied ? "✓ Link copiado" : "Copiar link de reserva para clientes"}
        </button>
      )}
    </div>
  );
}

/* ── Loading Skeleton ─────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, g) => (
        <div key={g}>
          <div className="h-6 w-32 bg-neutral-100 rounded-full mb-3 animate-pulse" />
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-xl p-4 flex gap-4 animate-pulse">
                <div className="w-20 space-y-2">
                  <div className="h-6 bg-neutral-100 rounded" />
                  <div className="h-3 bg-neutral-100 rounded w-2/3" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function groupByDay(events) {
  const groups = {};
  events.forEach((ev) => {
    const key = toDateKey(new Date(ev.start_time));
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}
