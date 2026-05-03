// src/pages/backoffice/solicitudes/components/InformeAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPATCH, boUpload } from "../../../../services/backofficeApi";
import { API_URL, formatearFecha } from "../utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(s) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-amber-600";
  return "text-red-500";
}
function barColor(s) {
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#f59e0b";
  return "#ef4444";
}

function MasterRowAdmin({ posicion, resultado, editMode, onArriba, onAbajo, onEliminar, esFirst, esLast }) {
  const { master, score } = resultado;
  const dur =
    master.duracion_anios === 1 ? "1 año"
    : master.duracion_anios === 1.5 ? "18 meses"
    : `${master.duracion_anios} años`;
  const precio = master.precio_total_estimado
    ? `€${Math.round(master.precio_total_estimado).toLocaleString("es-ES")}`
    : null;

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-neutral-100 last:border-0">
      {editMode && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onArriba} disabled={esFirst}
            className="w-5 h-5 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 text-[10px] flex items-center justify-center leading-none">▲</button>
          <button onClick={onAbajo} disabled={esLast}
            className="w-5 h-5 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 text-[10px] flex items-center justify-center leading-none">▼</button>
        </div>
      )}
      <div className="shrink-0 w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold flex items-center justify-center">
        {posicion}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-800 leading-tight">{master.nombre_limpio}</p>
        <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
          {master.universidad.nombre_completo}
          {master.universidad.ciudad ? ` · ${master.universidad.ciudad}` : ""}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {precio && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{precio}</span>}
          <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{dur}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
            score >= 80 ? "bg-emerald-50 text-emerald-700"
            : score >= 60 ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-600"
          }`}>{score}%</span>
        </div>
      </div>
      <div className="shrink-0 w-9 text-center">
        <div className={`text-sm font-black ${scoreColor(score)}`}>{score}</div>
        <div className="mt-0.5 h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: barColor(score) }} />
        </div>
      </div>
      {editMode && (
        <button onClick={onEliminar}
          className="shrink-0 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 text-xs flex items-center justify-center ml-1 transition">
          ✕
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function InformeAdmin({ detalle, recargar }) {
  // ── PDF state (existente) ──
  const [subiendoInforme, setSubiendoInforme] = useState(false);

  // ── Compatibilidad state ──
  const [compat, setCompat]       = useState(null);
  const [loadingCompat, setLoading] = useState(true);
  const [editMode, setEditMode]   = useState(false);
  const [listaEdit, setListaEdit] = useState([]);
  const [searchQ, setSearchQ]     = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarCompatibilidad(); }, [detalle.id_solicitud]); // eslint-disable-line

  async function cargarCompatibilidad() {
    setLoading(true);
    try {
      const r = await boGET(`/backoffice/solicitudes/${detalle.id_solicitud}/compatibilidad`);
      if (r.ok) setCompat(r);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }

  async function regenerar() {
    setCompat(null);
    setEditMode(false);
    await cargarCompatibilidad();
  }

  function entrarEdicion() {
    const base = detalle.informe_compat_curado ?? compat?.resultados?.slice(0, 20) ?? [];
    setListaEdit(base.map((r) => ({ ...r })));
    setEditMode(true);
    setSearchQ("");
  }

  function moverArriba(idx) {
    if (idx === 0) return;
    const l = [...listaEdit];
    [l[idx - 1], l[idx]] = [l[idx], l[idx - 1]];
    setListaEdit(l);
  }

  function moverAbajo(idx) {
    if (idx === listaEdit.length - 1) return;
    const l = [...listaEdit];
    [l[idx], l[idx + 1]] = [l[idx + 1], l[idx]];
    setListaEdit(l);
  }

  function eliminarItem(idx) {
    setListaEdit((prev) => prev.filter((_, i) => i !== idx));
  }

  function añadirItem(r) {
    if (listaEdit.some((e) => e.master.id_master === r.master.id_master)) return;
    setListaEdit((prev) => [...prev, r]);
    setSearchQ("");
  }

  async function guardarCurado() {
    setGuardando(true);
    try {
      await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, {
        lista: listaEdit,
      });
      await recargar();
      setEditMode(false);
    } catch { alert("Error al guardar"); }
    finally { setGuardando(false); }
  }

  async function restaurarAuto() {
    setGuardando(true);
    try {
      await boPATCH(`/backoffice/solicitudes/${detalle.id_solicitud}/informe-compat`, { lista: null });
      await recargar();
    } catch { alert("Error al restaurar"); }
    finally { setGuardando(false); }
  }

  // ── Derived ──
  const listaVista   = detalle.informe_compat_curado ?? compat?.resultados?.slice(0, 20) ?? [];
  const isCurado     = !!detalle.informe_compat_curado;
  const todosCompat  = compat?.resultados ?? [];
  const sugerencias  = searchQ.length >= 2
    ? todosCompat
        .filter((r) =>
          r.master.nombre_limpio.toLowerCase().includes(searchQ.toLowerCase()) &&
          !listaEdit.some((e) => e.master.id_master === r.master.id_master)
        )
        .slice(0, 8)
    : [];

  // ── PDF / Sheets functions (existente) ──
  async function handleUploadInforme(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoInforme(true);
    try {
      const r = await boUpload(`/api/admin/solicitudes/${detalle.id_solicitud}/informe`, file);
      if (!r.ok) { alert(r.msg || "No se pudo subir el informe"); return; }
      await recargar();
    } finally { setSubiendoInforme(false); }
  }

  async function manejarInformeAdmin(modo) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) return alert("No existe sesión de backoffice");
      const resp = await fetch(
        `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/informe${modo === "ver" ? "?view=1" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) return alert("No se pudo obtener el informe");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      if (modo === "ver") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = detalle.informe_nombre_original || "informe";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al abrir/descargar el informe");
    }
  }

  const datos    = detalle?.datos_formulario || {};
  const planLabel = detalle?.titulo || "Plan contratado";
  const filtros  = [
    datos.comunidades_preferidas
      ? (Array.isArray(datos.comunidades_preferidas) ? datos.comunidades_preferidas.join(", ") : datos.comunidades_preferidas)
      : null,
    datos.presupuesto_hasta
      ? `Máx. ${Number(datos.presupuesto_hasta).toLocaleString("es-ES")} €`
      : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="space-y-0 -mx-5 -mt-4 overflow-hidden">

      {/* ── Banner generador IA ─────────────────────────────── */}
      <div className="px-5 pt-4 pb-4" style={{ background: "linear-gradient(135deg, #1D6A4A, #1A3557)" }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg shrink-0">✦</div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-bold text-white mb-0.5">Generador de Informe con IA</p>
            <p className="text-xs text-white/70">{filtros ? `Filtros: ${filtros}` : planLabel}</p>
          </div>
          {planLabel && (
            <span className="bg-[#F5C842] text-[#1A3557] text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
              📦 {planLabel}
            </span>
          )}
          <button onClick={regenerar} disabled={loadingCompat}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/12 text-white/80 border border-white/20 hover:bg-white/20 transition disabled:opacity-50 shrink-0">
            🔄 Regenerar
          </button>
        </div>
      </div>

      {/* ── PDF manual ─────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3 space-y-3 border-b border-neutral-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {detalle.informe_fecha_subida ? (
            <p className="text-xs text-neutral-500">
              PDF subido el <span className="font-medium text-neutral-700">{formatearFecha(detalle.informe_fecha_subida)}</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-500">Aún no se ha subido un PDF de informe.</p>
          )}
          <label className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 cursor-pointer font-medium transition">
            {subiendoInforme ? "Subiendo…" : "Subir / reemplazar PDF"}
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
              onChange={handleUploadInforme} />
          </label>
        </div>
        {detalle.informe_fecha_subida && (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-100 rounded-xl bg-neutral-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {detalle.informe_nombre_original || "Informe de búsqueda"}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {formatearFecha(detalle.informe_fecha_subida)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => manejarInformeAdmin("ver")}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-white transition">
                Ver
              </button>
              <button type="button" onClick={() => manejarInformeAdmin("descargar")}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition">
                Descargar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Compatibilidad automática ───────────────────────── */}
      <div className="px-5 pt-4 pb-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Compatibilidad automática</p>
            {isCurado && !editMode && (
              <span className="text-[10px] bg-[#023A4B]/10 text-[#023A4B] font-semibold px-2 py-0.5 rounded-md">
                Lista curada
              </span>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {!editMode && (
              <>
                {isCurado && (
                  <button onClick={restaurarAuto} disabled={guardando}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-50">
                    Restaurar auto
                  </button>
                )}
                {listaVista.length > 0 && (
                  <button onClick={entrarEdicion}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition">
                    ✏️ Modificar
                  </button>
                )}
              </>
            )}
            {editMode && (
              <>
                <button onClick={() => setEditMode(false)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition">
                  Cancelar
                </button>
                <button onClick={guardarCurado} disabled={guardando}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#023A4B] text-white hover:bg-[#035670] transition disabled:opacity-50">
                  {guardando ? "Guardando…" : "Guardar curaduría"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Parámetros de scoring */}
        {datos && (
          <details className="mb-3 group">
            <summary className="text-[11px] font-semibold text-neutral-500 cursor-pointer select-none hover:text-neutral-700 list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              Parámetros usados en el cálculo
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 bg-neutral-50 rounded-xl px-4 py-3 text-[11px]">
              {[
                ["Rama del máster",    datos.area_interes_master],
                ["Sub-área",           datos.sub_area_interes || compat?.perfil?.area],
                ["Área de carrera",    datos.area_carrera],
                ["Promedio",           datos.promedio_peru ? `${datos.promedio_peru} / ${datos.promedio_escala || 10}` : null],
                ["Posición académica", datos.ubicacion_grupo],
                ["Experiencia",        datos.experiencia_anios],
                ["Vinculada al área",  datos.experiencia_vinculada],
                ["Inglés",             datos.ingles_situacion],
                ["Objetivo",           datos.objetivo_master],
                ["Investigación",      datos.investigacion_experiencia],
                ["Modalidad",          datos.modalidad_preferida],
                ["Duración",           datos.duracion_preferida],
                ["Prácticas",          datos.practicas_preferencia],
                ["Presupuesto",        datos.presupuesto_hasta ? `€${Number(datos.presupuesto_hasta).toLocaleString("es-ES")}` : null],
                ["CCAA preferidas",    compat?.perfil?.ccaa?.join(", ")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-2 border-b border-neutral-100 pb-1 last:border-0">
                  <span className="text-neutral-400 shrink-0">{label}</span>
                  <span className="font-medium text-neutral-700 text-right truncate">{val || "—"}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Cargando */}
        {loadingCompat && (
          <div className="flex items-center gap-2 py-4 text-neutral-400">
            <div className="w-4 h-4 border-2 border-[#046C8C] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs">Calculando compatibilidad…</span>
          </div>
        )}

        {/* Sin datos */}
        {!loadingCompat && !compat && (
          <p className="text-xs text-neutral-400 italic py-2">
            No se pudo calcular. El cliente quizás no ha completado el formulario.
          </p>
        )}

        {!loadingCompat && compat && compat.total === 0 && (
          <p className="text-xs text-neutral-400 italic py-2">
            Sin programas compatibles. El cliente no ha indicado área de interés.
          </p>
        )}

        {/* Vista normal */}
        {!loadingCompat && !editMode && listaVista.length > 0 && (
          <>
            <p className="text-[11px] text-neutral-400 mb-2">
              {compat?.total ?? listaVista.length} programas ≥ 40% · mostrando {listaVista.length}
            </p>
            <div>
              {listaVista.map((r, i) => (
                <MasterRowAdmin key={r.master.id_master} posicion={i + 1} resultado={r}
                  editMode={false} />
              ))}
            </div>
          </>
        )}

        {/* Modo edición */}
        {!loadingCompat && editMode && (
          <div className="space-y-3">
            {/* Buscador para añadir */}
            <div className="relative">
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Buscar máster para añadir…"
                className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-[#023A4B] bg-white"
              />
              {sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {sugerencias.map((r) => (
                    <button key={r.master.id_master} type="button" onClick={() => añadirItem(r)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition border-b border-neutral-100 last:border-0">
                      <p className="text-xs font-medium text-neutral-800">{r.master.nombre_limpio}</p>
                      <p className="text-[11px] text-neutral-500">{r.master.universidad.nombre_completo} · <span className={`font-bold ${scoreColor(r.score)}`}>{r.score}%</span></p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista editable */}
            <div>
              {listaEdit.length === 0 && (
                <p className="text-xs text-neutral-400 italic py-3 text-center">
                  Lista vacía. Busca y añade programas.
                </p>
              )}
              {listaEdit.map((r, i) => (
                <MasterRowAdmin key={r.master.id_master} posicion={i + 1} resultado={r}
                  editMode={true}
                  esFirst={i === 0} esLast={i === listaEdit.length - 1}
                  onArriba={() => moverArriba(i)}
                  onAbajo={() => moverAbajo(i)}
                  onEliminar={() => eliminarItem(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
