// src/pages/panel/PanelCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

/* ---------- Componentes de UI ---------- */

function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full text-left px-4 py-3 text-sm rounded-xl mb-1 transition " +
        (active
          ? "bg-white/15 text-white font-semibold"
          : "text-white/80 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </button>
  );
}

/* ---------- Panel principal ---------- */

export default function PanelCliente() {
  const [tab, setTab] = useState("citas"); // "perfil" | "citas" | "servicios"
  const [user, setUser] = useState(null);

  useEffect(() => {
    cargarMe();
  }, []);

  async function cargarMe() {
    try {
      const r = await apiGET("/auth/me");
      if (r.ok) {
        setUser(r.user || r.cliente || r);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* SIDEBAR IZQUIERDO */}
      <aside className="w-72 bg-gradient-to-b from-[#023A4B] to-[#046C8C] text-white flex flex-col">
        {/* Header usuario */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold">
              {user?.nombre?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate">
                {user?.nombre || "Mi panel Inspira"}
              </span>
              <span className="text-xs text-white/70 truncate">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Menú */}
        <div className="flex-1 px-4 py-4">
          <SidebarItem
            label="Mis citas"
            active={tab === "citas"}
            onClick={() => setTab("citas")}
          />
          <SidebarItem
            label="Perfil"
            active={tab === "perfil"}
            onClick={() => setTab("perfil")}
          />
          <SidebarItem
            label="Mis servicios"
            active={tab === "servicios"}
            onClick={() => setTab("servicios")}
          />
        </div>

        <div className="px-6 py-4 text-xs text-white/60 border-t border-white/10">
          Inspira | Panel de cliente
        </div>
      </aside>

      {/* CONTENIDO DERECHA */}
      <main className="flex-1 px-8 py-8">
        <header className="mb-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Panel de cliente
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">Mi panel</h1>
        </header>

        <div className="max-w-4xl">
          {tab === "perfil" && <PerfilCliente user={user} />}
          {tab === "citas" && <MisCitas />}
          {tab === "servicios" && <MisServicios />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Perfil (igual que tenías) ---------- */

function PerfilCliente({ user }) {
  if (!user) return <p>Cargando datos...</p>;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <p className="mb-2">
        <strong>Nombre:</strong> {user.nombre}
      </p>
      <p className="mb-2">
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
}

/* ---------- Mis Citas (MISMA LÓGICA QUE TU CÓDIGO) ---------- */

function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    setLoading(true);
    try {
      const r = await apiGET("/diagnostico/mis-citas"); // SE MANTIENE TU ENDPOINT
      if (r.ok) {
        setCitas(r.citas || []);
      } else {
        setCitas([]);
      }
    } catch (e) {
      console.error(e);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Cargando tus citas...</p>;

  if (!citas || citas.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <p className="text-neutral-600">
          Aún no tienes citas de diagnóstico registradas.
        </p>
      </div>
    );
  }

  const ahora = new Date();
  const futuras = [];
  const pasadas = [];

  citas.forEach((c) => {
    const fechaStr = c.fecha;
    const hi = c.hora_inicio || "00:00";
    const [h, m] = hi.split(":");
    const d = new Date(fechaStr);
    if (!isNaN(d)) {
      d.setHours(Number(h || 0), Number(m || 0), 0, 0);
      if (d >= ahora) futuras.push(c);
      else pasadas.push(c);
    } else {
      futuras.push(c);
    }
  });

  function badgeEstado(estado) {
    if (!estado) return null;
    const base =
      "inline-block px-2 py-0.5 text-xs rounded-full font-medium mr-2";
    if (estado === "pendiente_pago")
      return (
        <span className={base + " bg-amber-100 text-amber-700"}>
          Pendiente de pago
        </span>
      );
    if (estado === "pagado")
      return (
        <span className={base + " bg-emerald-100 text-emerald-700"}>
          Pagado
        </span>
      );
    if (estado === "cancelado")
      return (
        <span className={base + " bg-red-100 text-red-700"}>Cancelado</span>
      );
    return (
      <span className={base + " bg-neutral-100 text-neutral-700"}>
        {estado}
      </span>
    );
  }

  function renderLista(lista, titulo) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">{titulo}</h3>
        <div className="space-y-3">
          {lista.map((c) => (
            <div
              key={c.id_pre_reserva}
              className="border border-neutral-200 rounded-xl bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm"
            >
              <div>
                <div className="font-semibold text-neutral-900">
                  {c.fecha}{" "}
                  {c.hora_inicio && c.hora_fin
                    ? `· ${c.hora_inicio} – ${c.hora_fin}`
                    : ""}
                </div>
                <div className="text-sm text-neutral-600 mt-1">
                  Diagnóstico de inmigración
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-sm text-right">
                {badgeEstado(c.estado)}
                {c.monto && (
                  <div className="text-neutral-700 mt-1">
                    Importe: {Number(c.monto).toFixed(2)} €
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {futuras.length > 0 && renderLista(futuras, "Próximas citas")}
      {pasadas.length > 0 && renderLista(pasadas, "Historial de citas")}
    </div>
  );
}

/* ---------- Mis Servicios (igual que tenías) ---------- */

function MisServicios() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <p className="text-neutral-600">
        Aquí aparecerán tus servicios contratados (trámites, paquetes, etc.).
      </p>
    </div>
  );
}
