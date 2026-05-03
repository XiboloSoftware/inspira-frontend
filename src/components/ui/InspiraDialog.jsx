import { useEffect, useRef, useState } from "react";
import { _registerDialogHandler } from "../../services/dialogService";

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconWarn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function IconQuestion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={22} height={22}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={22} height={22}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

const TOAST_CONFIG = {
  success: { bg: "#f0faf4", border: "#1a5c3a", iconColor: "#1a5c3a", Icon: IconCheck },
  error:   { bg: "#fef2f2", border: "#dc2626", iconColor: "#dc2626", Icon: IconX },
  warning: { bg: "#fffbeb", border: "#F49E4B", iconColor: "#D88436", Icon: IconWarn },
  info:    { bg: "#f0f9ff", border: "#0ea5e9", iconColor: "#0ea5e9", Icon: IconInfo },
};

let _nextId = 0;

export default function InspiraDialog() {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    _registerDialogHandler((item) => {
      if (item.kind === "toast") {
        const id = ++_nextId;
        setToasts((prev) => [...prev, { id, message: item.message, toastType: item.toastType || "info" }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
      } else {
        setModal(item);
      }
    });
  }, []);

  useEffect(() => {
    if (modal?.kind === "prompt") {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [modal]);

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function resolveModal(value) {
    const cb = modal?.resolve;
    setModal(null);
    cb?.(value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") resolveModal(inputRef.current?.value ?? "");
    if (e.key === "Escape") resolveModal(null);
  }

  return (
    <>
      {/* ── Toasts ────────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        alignItems: "flex-end", pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const cfg = TOAST_CONFIG[t.toastType] || TOAST_CONFIG.info;
          const { Icon } = cfg;
          return (
            <div key={t.id} style={{
              pointerEvents: "all",
              animation: "inspira-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              background: cfg.bg,
              border: `1px solid ${cfg.border}22`,
              borderLeft: `4px solid ${cfg.border}`,
              borderRadius: 14,
              boxShadow: "0 4px 28px rgba(0,0,0,0.13)",
              padding: "12px 14px 12px 14px",
              minWidth: 260, maxWidth: 380,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: 1 }}>
                <Icon />
              </span>
              <span style={{
                flex: 1, fontSize: 13.5, lineHeight: 1.55,
                color: "#1A1A1A", fontFamily: "Inter, sans-serif", fontWeight: 450,
              }}>
                {t.message}
              </span>
              <button
                onClick={() => dismissToast(t.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#9B9B9B", padding: "1px 0 0 4px",
                  fontSize: 17, lineHeight: 1, flexShrink: 0,
                  fontFamily: "Inter, sans-serif",
                }}
                aria-label="Cerrar"
              >×</button>
            </div>
          );
        })}
      </div>

      {/* ── Modal (confirm / prompt) ──────────────────────────────────── */}
      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) resolveModal(modal.kind === "confirm" ? false : null); }}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10,20,15,0.48)", backdropFilter: "blur(5px)",
            animation: "inspira-fade-in 0.2s ease",
          }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 22,
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            padding: "32px 28px 26px",
            maxWidth: 448, width: "90vw",
            animation: "inspira-modal-in 0.32s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: modal.kind === "confirm" ? "#e8f5ee" : "#fff8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {modal.kind === "confirm"
                  ? <span style={{ color: "#1a5c3a" }}><IconQuestion /></span>
                  : <span style={{ color: "#F49E4B" }}><IconEdit /></span>
                }
              </div>
              <h2 style={{
                margin: 0, fontSize: 17, fontWeight: 650,
                color: "#1A1A1A", fontFamily: "Inter, sans-serif", lineHeight: 1.3,
              }}>
                {modal.title || (modal.kind === "confirm" ? "¿Confirmar acción?" : "Introduce un valor")}
              </h2>
            </div>

            {/* Message */}
            <p style={{
              margin: "0 0 20px 58px", fontSize: 14, color: "#4A4A4A",
              lineHeight: 1.65, fontFamily: "Inter, sans-serif",
            }}>
              {modal.message}
            </p>

            {/* Prompt input */}
            {modal.kind === "prompt" && (
              <input
                ref={inputRef}
                defaultValue={modal.defaultValue || ""}
                onKeyDown={handleKeyDown}
                placeholder="Escribe aquí..."
                style={{
                  display: "block", width: "100%", boxSizing: "border-box",
                  border: "1.5px solid #E5E5E5", borderRadius: 11,
                  padding: "10px 14px", fontSize: 14,
                  fontFamily: "Inter, sans-serif", marginBottom: 20,
                  outline: "none", color: "#1A1A1A",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1a5c3a";
                  e.target.style.boxShadow = "0 0 0 3px rgba(26,92,58,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E5E5";
                  e.target.style.boxShadow = "none";
                }}
              />
            )}

            {/* Accent line */}
            <div style={{
              height: 1, background: "linear-gradient(90deg, #e8f5ee, #E5E5E5)",
              margin: "0 0 20px",
            }} />

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => resolveModal(modal.kind === "confirm" ? false : null)}
                style={{
                  padding: "10px 22px", borderRadius: 11,
                  border: "1.5px solid #E5E5E5", background: "#fff",
                  cursor: "pointer", fontSize: 14, fontWeight: 500,
                  color: "#4A4A4A", fontFamily: "Inter, sans-serif",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.borderColor = "#ccc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E5E5E5"; }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modal.kind === "confirm") resolveModal(true);
                  else resolveModal(inputRef.current?.value ?? "");
                }}
                style={{
                  padding: "10px 22px", borderRadius: 11, border: "none",
                  background: "linear-gradient(135deg, #1a5c3a 0%, #154f31 100%)",
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  color: "#fff", fontFamily: "Inter, sans-serif",
                  boxShadow: "0 2px 12px rgba(26,92,58,0.25)",
                  transition: "opacity 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,92,58,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,92,58,0.25)"; }}
              >
                {modal.kind === "confirm" ? "Confirmar" : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
