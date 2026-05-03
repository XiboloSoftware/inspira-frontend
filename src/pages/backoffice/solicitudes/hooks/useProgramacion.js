// Hook de estado y lógica para ProgramacionPostulacionesAdmin
import { useEffect, useState } from "react";
import { boGET, boPATCH, boPOST } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";

function toDateInputValue(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export { toDateInputValue };

export function useProgramacion(idSolicitud) {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const r = await boGET(`/api/programacion/admin/solicitudes/${idSolicitud}`);
      if (!r.ok) { setError(r.message || r.msg || "No se pudo cargar la programación."); setMasters([]); return; }
      setMasters(r.masters || []);
    } catch (e) {
      console.error(e);
      setError("Error al cargar la programación de postulaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [idSolicitud]);

  function handleChangeField(idxMaster, idxTarea, field, value) {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        const tareas = (m.tareas || []).map((t, j) => j === idxTarea ? { ...t, [field]: value } : t);
        return { ...m, tareas };
      })
    );
  }

  function handleAddRow(idxMaster) {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        return { ...m, tareas: [...(m.tareas || []), { tarea: "", fecha_limite: null, estado_tarea: "PENDIENTE", responsable: "INSPIRA", observaciones: "" }] };
      })
    );
  }

  function handleRemoveRow(idxMaster, idxTarea) {
    setMasters((prev) =>
      prev.map((m, i) => {
        if (i !== idxMaster) return m;
        return { ...m, tareas: (m.tareas || []).filter((_, j) => j !== idxTarea) };
      })
    );
  }

  async function handleGuardarMaster(idxMaster) {
    const m = masters[idxMaster];
    if (!m) return;
    setSaving(true);
    try {
      const payload = {
        master_label: m.master_label,
        tareas: (m.tareas || []).map((t) => ({
          tarea: t.tarea,
          fecha_limite: t.fecha_limite ? toDateInputValue(t.fecha_limite) : "",
          estado_tarea: t.estado_tarea || "PENDIENTE",
          responsable: t.responsable || "INSPIRA",
          observaciones: t.observaciones || "",
        })),
      };
      const r = await boPATCH(
        `/api/programacion/admin/solicitudes/${idSolicitud}/master/${m.master_prioridad || idxMaster + 1}`,
        payload
      );
      if (!r.ok) { dialog.toast(r.message || r.msg || "No se pudo guardar.", "error"); return; }
      await cargar();
      dialog.toast("Programación guardada.", "success");
    } catch (e) {
      console.error(e);
      dialog.toast("Error al guardar la programación.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerar() {
    if (!await dialog.confirm("Se crearán tareas por defecto según la elección del cliente. ¿Continuar?")) return;
    setSaving(true);
    try {
      const r = await boPOST(`/api/programacion/admin/solicitudes/${idSolicitud}/generar-desde-eleccion`, {});
      if (!r.ok) { dialog.toast(r.message || r.msg || "No se pudo generar la programación.", "error"); return; }
      await cargar();
      dialog.toast("Tareas generadas correctamente.", "success");
    } catch (e) {
      console.error(e);
      dialog.toast("Error al generar las tareas por defecto.", "error");
    } finally {
      setSaving(false);
    }
  }

  return { masters, loading, saving, error, handleChangeField, handleAddRow, handleRemoveRow, handleGuardarMaster, handleGenerar };
}
