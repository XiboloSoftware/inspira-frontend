import { useEffect, useState } from "react";
import { boGET, boPOST } from "../../../services/backofficeApi";

const DAYS_OPTIONS = [
  { label: "Hoy + 7 días", value: 7 },
  { label: "14 días", value: 14 },
  { label: "30 días", value: 30 },
];

function getUserRole() {
  try {
    return JSON.parse(localStorage.getItem("bo_user") || "{}").rol || "";
  } catch {
    return "";
  }
}

export default function Agenda() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [cancelModal, setCancelModal] = useState(null); // { uuid, clientName }
  const [cancelStep, setCancelStep] = useState(1);      // 1 = razón, 2 = confirmación final
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = getUserRole() === "admin";

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

  function openCancelModal(uuid, clientName) {
    setCancelModal({ uuid, clientName });
    setCancelStep(1);
    setCancelReason("");
  }

  function closeCancelModal() {
    setCancelModal(null);
    setCancelStep(1);
    setCancelReason("");
  }

  async function handleCancel() {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const res = await boPOST(`/backoffice/calendly/events/${cancelModal.uuid}/cancel`, {
        reason: cancelReason.trim() || "Cancelado por el equipo de Inspira Legal",
      });
      if (res.error) throw new Error(res.error);
      closeCancelModal();
      load(days);
    } catch (err) {
      alert("Error al cancelar: " + err.message);
    } finally {
      setCancelling(false);
    }
  }

  function copyLink() {
    if (!data?.booking_url) return;
    navigator.clipboard.writeText(data.booking_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

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
              isAdmin={isAdmin}
              onCancel={openCancelModal}
            />
          ))}
        </div>
      )}

      {/* Modal cancelación — doble confirmación */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Paso 1: Motivo */}
            {cancelStep === 1 && (
              <>
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-lg">⚠️</span>
                    <h3 className="text-base font-semibold text-neutral-800">Cancelar reunión</h3>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Cliente: <span className="font-medium text-neutral-700">{cancelModal.clientName}</span>
                  </p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <label className="text-xs font-medium text-neutral-600 block">
                    Motivo de cancelación
                  </label>
                  <textarea
                    className="w-full border border-neutral-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                    rows={3}
                    placeholder="Ej: Reagendamiento solicitado por el equipo..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-neutral-400">
                    Este mensaje se enviará automáticamente al cliente por email.
                  </p>
                </div>
                <div className="flex gap-2 px-6 pb-5 justify-end">
                  <button
                    onClick={closeCancelModal}
                    className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => setCancelStep(2)}
                    className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium"
                  >
                    Continuar →
                  </button>
                </div>
              </>
            )}

            {/* Paso 2: Confirmación final */}
            {cancelStep === 2 && (
              <>
                <div className="bg-red-50 border-b border-red-100 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-lg">🚨</span>
                    <h3 className="text-base font-semibold text-neutral-800">Confirmación final</h3>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                    <p className="font-semibold mb-1">Esta acción no se puede deshacer.</p>
                    <p>
                      Se cancelará la reunión con{" "}
                      <span className="font-medium">{cancelModal.clientName}</span> y Calendly
                      le enviará un aviso por email de forma automática.
                    </p>
                  </div>
                  {cancelReason.trim() && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-sm text-neutral-600">
                      <span className="text-xs font-medium text-neutral-400 block mb-1">Motivo que se enviará:</span>
                      {cancelReason}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-6 pb-5 justify-end">
                  <button
                    onClick={() => setCancelStep(1)}
                    className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    {cancelling ? "Cancelando..." : "Sí, cancelar definitivamente"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

/* ── Day Section ──────────────────────────────────────────────── */
function DaySection({ dateKey, isToday, events, isAdmin, onCancel }) {
  const date = new Date(dateKey + "T12:00:00");
  const label = isToday
    ? "Hoy"
    : date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`text-sm font-semibold capitalize px-3 py-1 rounded-full ${
            isToday ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {label}
        </div>
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">
          {events.length} reunión{events.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div className="grid gap-3">
        {events.map((event) => (
          <EventCard key={event.uuid} event={event} isAdmin={isAdmin} onCancel={onCancel} />
        ))}
      </div>
    </div>
  );
}

/* ── Event Card ───────────────────────────────────────────────── */
function EventCard({ event, isAdmin, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const now = new Date();
  const isPast = end < now;
  const isNow = start <= now && now <= end;
  const invitee = event.invitees?.[0];
  const duration = Math.round((end - start) / 60000);

  // Tiempo restante hasta la reunión
  const msUntil = start - now;
  const hoursUntil = Math.floor(msUntil / 3600000);
  const minutesUntil = Math.floor((msUntil % 3600000) / 60000);
  const countdown =
    msUntil > 0 && msUntil < 86400000
      ? hoursUntil > 0
        ? `en ${hoursUntil}h ${minutesUntil}m`
        : `en ${minutesUntil} min`
      : null;

  // Cuándo agendó
  const bookedAt = invitee?.created_at
    ? new Date(invitee.created_at).toLocaleDateString("es-ES", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  const extraQuestions = (invitee?.questions || []);

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all ${
        isNow
          ? "border-primary ring-2 ring-primary/20"
          : isPast
          ? "border-neutral-100 opacity-60"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      {/* Banda superior si es ahora */}
      {isNow && (
        <div className="bg-primary text-white text-xs font-semibold text-center py-1 tracking-wide">
          EN CURSO AHORA
        </div>
      )}

      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Hora y duración */}
        <div className="flex-shrink-0 w-28 text-center sm:text-left">
          <div className="text-2xl font-bold text-primary leading-tight">
            {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {start.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} –{" "}
            {end.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-neutral-400">{duration} min</div>
          <StatusBadge status={event.status} past={isPast} isNow={isNow} />
          {countdown && (
            <div className="mt-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
              {countdown}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-neutral-800">
              {invitee?.name || "Sin datos del cliente"}
            </span>
            <span className="text-xs text-neutral-400 bg-neutral-100 rounded px-2 py-0.5">
              {event.event_name}
            </span>
          </div>
          {invitee?.email && (
            <a
              href={`mailto:${invitee.email}`}
              className="text-xs text-primary hover:underline block"
            >
              {invitee.email}
            </a>
          )}

          {/* Preguntas del formulario */}
          {extraQuestions.length > 0 && (
            <div className="space-y-1 mt-2">
              {extraQuestions.map((q, i) => (
                <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
                    {q.question}
                  </div>
                  <div className="text-xs text-neutral-700">{q.answer}</div>
                </div>
              ))}
            </div>
          )}

          {/* Cuándo agendó */}
          {bookedAt && (
            <div className="text-[10px] text-neutral-400 mt-1">
              Agendado el {bookedAt}
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
          {isAdmin && !isPast && event.status === "active" && (
            <button
              onClick={() => onCancel(event.uuid, invitee?.name || "cliente")}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status, past, isNow }) {
  if (isNow) return null;
  if (past) return <span className="text-[10px] text-neutral-400 mt-1 block">Completada</span>;
  if (status === "canceled") return <span className="text-[10px] text-red-400 mt-1 block font-medium">Cancelada</span>;
  return <span className="text-[10px] text-green-600 mt-1 block font-medium">Confirmada</span>;
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
                <div className="w-24 space-y-2">
                  <div className="h-7 bg-neutral-100 rounded" />
                  <div className="h-3 bg-neutral-100 rounded w-2/3" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  <div className="h-8 bg-neutral-50 rounded-lg w-full mt-2" />
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
