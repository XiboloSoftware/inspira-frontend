// src/pages/panel/PanelCliente.jsx
import { useEffect, useState } from "react";
import { apiGET } from "../../services/api";

/* --------- Helpers de UI --------- */

function SidebarItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl text-left transition " +
        (active
          ? "bg-white/15 text-white font-medium"
          : "text-white/80 hover:bg-white/10 hover:text-white")
      }
    >
      <span>•</span>
      <span>{label}</span>
    </button>
  );
}

function BadgeEstado({ estado }) {
  const map = {
    pendiente_pago: {
      label: "Pendiente de pago",
      className: "bg-amber-100 text-amber-700",
    },
    pagado: {
      label: "Pagado",
      className: "bg-emerald-100 text-emerald-700",
    },
    cancelado: {
      label: "Cancelado",
      className: "bg-rose-100 text-rose-700",
    },
  };

  const cfg = map[estado] || {
    label: estado,
    className: "bg-neutral-100 text-neutral-700",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

/* --------- Vistas del contenido --------- */

function VistaPerfil({ user }) {
  if (!user) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Perfil</h2>
      <div className="space-y-2 text-sm text-neutral-700">
        <p>
          <span className="font-medium">Nombre: </span>
          {user.nombre || user.name}
        </p>
        <p>
          <span className="font-medium">Correo: </span>
          {user.email || user.correo}
        </p>
        {user.telefono && (
          <p>
            <span className="font-medium">Teléfono: </span>
            {user.telefono}
          </p>
        )}
      </div>
    </div>
  );
}

function VistaCitas({ citas, loading }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Historial de citas</h2>

      {loading && <p className="text-sm text-neutral-500">Cargando citas…</p>}

      {!loading && (!citas || citas.length === 0) && (
        <p className="text-sm text-neutral-500">
          Aún no tienes citas registradas. Reserva tu diagnóstico para empezar.
        </p>
      )}

      <div className="space-y-3">
        {citas.map((cita) => (
          <div
            key={cita.id_pre_reserva || cita.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-neutral-100 rounded-xl px-4 py-3 hover:bg-neutral-50"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">
                {cita.fecha_formateada || cita.fecha_hora || cita.fecha}
              </p>
              <p className="text-xs text-neutral-500">
                {cita.servicio || "Diagnóstico de inmigración"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-500">Importe</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {cita.monto?.toFixed
                    ? cita.monto.toFixed(2)
                    : cita.monto}{" "}
                  {cita.moneda || "€"}
                </p>
              </div>
              <BadgeEstado estado={cita.estado} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VistaServicios() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        Mis servicios
      </h2>
      <p className="text-sm text-neutral-600">
        Aquí aparecerán tus servicios contratados (trámites, paquetes, etc.).
      </p>
    </div>
  );
}

function VistaRequerimientos() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        Requerimientos
      </h2>
      <p className="text-sm text-neutral-600">
        Próximamente verás aquí los documentos y pasos pendientes para tus
        trámites.
      </p>
    </div>
  );
}

function VistaNotificaciones() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        Notificaciones
      </h2>
      <p className="text-sm text-neutral-600">
        Aún no tienes notificaciones. Te avisaremos aquí sobre cambios en tus
        citas y trámites.
      </p>
    </div>
  );
}

function VistaTelegram() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">
        Grupo de Telegram
      </h2>
      <p className="text-sm text-neutral-600">
        Accede al grupo privado para recibir avisos, recordatorios y tips sobre
        tu proceso migratorio.
      </p>
    </div>
  );
}

/* --------- Componente principal --------- */

export default function PanelCliente() {
  const [section, setSection] = useState("citas"); // citas, servicios, requerimientos, notificaciones, telegram
  const [user, setUser] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);

  useEffect(() => {
    cargarMe();
    cargarCitas();
  }, []);

  async function cargarMe() {
    try {
      const r = await apiGET("/auth/me");
      if (r?.ok) {
        setUser(r.user || r.cliente || r);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function cargarCitas() {
    setLoadingCitas(true);
    try {
      // Ajusta la URL si tu endpoint de historial es diferente
      const r = await apiGET("/diagnostico/citas");
      if (r?.ok) {
        setCitas(r.citas || r.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCitas(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar izquierda */}
      <aside className="w-72 bg-gradient-to-b from-[#023A4B] to-[#046C8C] text-white flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {user?.nombre?.[0] || user?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {user?.nombre || user?.name || "Mi panel Inspira"}
              </span>
              <span className="text-xs text-white/70">
                {user?.email || user?.correo || ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem
            label="Mis citas"
            active={section === "citas"}
            onClick={() => setSection("citas")}
          />
          <SidebarItem
            label="Mis servicios"
            active={section === "servicios"}
            onClick={() => setSection("servicios")}
          />
          <SidebarItem
            label="Requerimientos"
            active={section === "requerimientos"}
            onClick={() => setSection("requerimientos")}
          />
          <SidebarItem
            label="Notificaciones"
            active={section === "notificaciones"}
            onClick={() => setSection("notificaciones")}
          />
          <SidebarItem
            label="Grupo de Telegram"
            active={section === "telegram"}
            onClick={() => setSection("telegram")}
          />
        </div>

        <div className="px-6 py-4 text-xs text-white/60 border-t border-white/10">
          Inspira | Panel de cliente
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 px-8 py-8">
        <header className="mb-6">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Panel de cliente
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">Mi panel</h1>
        </header>

        <div className="space-y-4">
          {/* Mostrar perfil siempre arriba */}
          <VistaPerfil user={user} />

          {/* Contenido según sección */}
          {section === "citas" && (
            <VistaCitas citas={citas} loading={loadingCitas} />
          )}
          {section === "servicios" && <VistaServicios />}
          {section === "requerimientos" && <VistaRequerimientos />}
          {section === "notificaciones" && <VistaNotificaciones />}
          {section === "telegram" && <VistaTelegram />}
        </div>
      </main>
    </div>
  );
}
