// src/pages/backoffice/solicitudes/EncabezadoClienteAdmin.jsx
// Bloque 1 — Encabezado del cliente con datos personales, académicos y plan contratado.

import { formatearFecha } from "./utils";

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Campo({ label, value, highlight, warn }) {
  const vacio = value === null || value === undefined || value === "";
  const cls = highlight
    ? "border-[#1D6A4A]/25 bg-[#E8F5EE]"
    : warn
      ? "border-amber-300 bg-amber-50"
      : "border-neutral-200 bg-neutral-50";
  return (
    <div className={`border rounded-xl px-3 py-2 ${cls}`}>
      <p className={`text-[9px] font-bold uppercase tracking-widest font-mono mb-1 ${warn ? "text-amber-600" : "text-neutral-400"}`}>
        {label}{warn && " ⚠"}
      </p>
      <p className={`text-[12px] font-semibold truncate ${warn ? "text-amber-700" : vacio ? "text-neutral-300 italic" : "text-neutral-900"}`}>
        {vacio ? "N/D" : value}
      </p>
    </div>
  );
}

function alertaPasaporte(vencimiento) {
  if (!vencimiento) return null;
  const d = new Date(vencimiento);
  if (isNaN(d)) return null;
  const hoy = new Date();
  const meses = (d - hoy) / (1000 * 60 * 60 * 24 * 30);
  if (meses < 0)  return { nivel: "rojo",    msg: `Pasaporte vencido (${formatearFecha(vencimiento)}) — renovación urgente.` };
  if (meses < 18) return { nivel: "rojo",    msg: `Pasaporte vence ${formatearFecha(vencimiento)} — menos de 18 meses. Renovar antes de postular.` };
  if (meses < 24) return { nivel: "amarillo", msg: `Pasaporte vence ${formatearFecha(vencimiento)} — menos de 2 años. Recomendar renovación pronto.` };
  return null;
}

export default function EncabezadoClienteAdmin({ detalle }) {
  const cli    = detalle?.cliente || {};
  const extra  = cli.datos_extra || {};
  const datos  = detalle?.datos_formulario || {};

  const vencPasaporte = extra.pasaporte_vencimiento ?? null;
  const alerta        = alertaPasaporte(vencPasaporte);

  // Comunidades geográficas del plan
  const comunidades = Array.isArray(datos.comunidades_preferidas)
    ? datos.comunidades_preferidas
    : datos.comunidades_preferidas
      ? [datos.comunidades_preferidas]
      : [];

  // Presupuesto
  const presupuesto = datos.presupuesto_hasta
    ? `Máx. ${Number(datos.presupuesto_hasta).toLocaleString("es-ES")} €/año`
    : null;

  // Tipo universidad / título
  const tipoUni    = datos.tipo_universidad    ?? null;
  const tipoTitulo = datos.tipo_titulo         ?? null;
  const inicioEstudios = extra.inicio_estudios ?? datos.inicio_estudios ?? null;
  const finEstudios    = extra.fin_estudios    ?? datos.fin_estudios    ?? null;
  const fechaTitulo    = extra.fecha_titulo    ?? datos.fecha_titulo    ?? null;
  const fechaNac       = extra.fecha_nacimiento ?? null;
  const emiPasaporte   = extra.pasaporte_emision ?? null;

  // Datos académicos: primero del formulario, si no del perfil del cliente
  const tituloUniv = datos.carrera_titulo    ?? extra.carrera_titulo    ?? null;
  const uniOrigen  = datos.universidad_origen ?? extra.universidad_origen ?? null;

  // Inicios previstos
  const inicioPrevisto = datos.inicio_previsto ?? extra.inicio_previsto ?? null;

  return (
    <div className="space-y-0">
      {/* Avatar + nombre + contacto */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8F5EE] to-[#EEF2F8] border-2 border-neutral-200 flex items-center justify-center shrink-0">
          <span className="font-serif text-lg font-bold text-[#1A3557]">{iniciales(cli.nombre)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base font-bold text-[#1A3557] leading-snug">{cli.nombre || "—"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
            {cli.email_contacto && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <span>✉</span>
                <span className="font-medium text-[#1A3557]">{cli.email_contacto}</span>
              </span>
            )}
            {cli.telefono && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <span>📱</span>
                <span className="font-medium text-[#1A3557]">{cli.telefono}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 px-5 pb-3">
        <Campo label="Fecha nacimiento"     value={fechaNac ? formatearFecha(fechaNac) : null} highlight={!!fechaNac} />
        <Campo label="Pasaporte"            value={cli.pasaporte}        warn={!!alerta && alerta.nivel === "rojo"} />
        <Campo label="Venc. pasaporte"      value={vencPasaporte ? formatearFecha(vencPasaporte) : null} warn={!!alerta} />
        <Campo label="Emisión pasaporte"    value={emiPasaporte  ? formatearFecha(emiPasaporte) : null}  highlight={!!emiPasaporte} />
        <Campo label="Título universitario"  value={tituloUniv}      highlight={!!tituloUniv} />
        <Campo label="Universidad origen" value={uniOrigen}           highlight={!!uniOrigen} />
        <Campo label="Inicio estudios"    value={inicioEstudios}      highlight={!!inicioEstudios} />
        <Campo label="Fin estudios"       value={finEstudios}         highlight={!!finEstudios} />
        <Campo label="Fecha del título"   value={fechaTitulo ? formatearFecha(fechaTitulo) : null} highlight={!!fechaTitulo} />
        <Campo label="País de origen"     value={cli.pais_origen}     highlight={!!cli.pais_origen} />
        <Campo label="Inicio previsto"    value={inicioPrevisto}      highlight={!!inicioPrevisto} />
        <Campo label="Presupuesto máx."   value={presupuesto}         highlight={!!presupuesto} />
        {tipoUni    && <Campo label="Tipo universidad" value={tipoUni}    highlight />}
        {tipoTitulo && <Campo label="Tipo título"      value={tipoTitulo} highlight />}
      </div>

      {/* Chip plan contratado */}
      {(detalle?.titulo || comunidades.length > 0) && (
        <div className="flex items-center gap-3 mx-5 mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A3557] to-[#023A4B]">
          <span className="text-lg shrink-0">📦</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white mb-1">
              {detalle.titulo || "Plan contratado"}
            </p>
            {comunidades.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {comunidades.map((c) => (
                  <span key={c} className="bg-[#F5C842] text-[#1A3557] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta pasaporte */}
      {alerta && (
        <div className={`mx-5 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs leading-relaxed
          ${alerta.nivel === "rojo"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-amber-50 border border-amber-200 text-amber-800"}`}
        >
          <span className="shrink-0 text-sm">{alerta.nivel === "rojo" ? "🔴" : "⚠️"}</span>
          <span>{alerta.msg}</span>
        </div>
      )}
    </div>
  );
}
