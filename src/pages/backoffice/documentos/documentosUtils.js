// Utilidades compartidas para la sección de Documentos
import { dialog } from "../../../services/dialogService";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getUser() {
  try {
    const u = localStorage.getItem("bo_user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fileIcon(mime) {
  if (!mime) return "📄";
  if (mime.includes("pdf")) return "📕";
  if (mime.includes("image")) return "🖼️";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
  return "📄";
}

export async function descargarDocumento(doc) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo descargar el archivo", "error"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.nombre_original;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    dialog.toast("Error al descargar el archivo", "error");
  }
}

export async function abrirInforme(informe) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/admin/solicitudes/${informe.id_solicitud}/informe`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo abrir el informe", "error"); return; }
    const blob = await r.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  } catch {
    dialog.toast("Error al abrir el informe", "error");
  }
}

export async function abrirJustificante(j) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/portales/justificantes/${j.id_justificante}/descargar`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo abrir el justificante", "error"); return; }
    const blob = await r.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  } catch {
    dialog.toast("Error al abrir el justificante", "error");
  }
}

export async function descargarInforme(informe) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/admin/solicitudes/${informe.id_solicitud}/informe`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo descargar el informe", "error"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = informe.nombre_original || "informe";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    dialog.toast("Error al descargar el informe", "error");
  }
}

export async function descargarJustificante(j) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/portales/justificantes/${j.id_justificante}/descargar`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo descargar el justificante", "error"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = j.nombre_original || "justificante";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    dialog.toast("Error al descargar el justificante", "error");
  }
}

export async function descargarZipCliente(idCliente, nombreCliente) {
  const token = localStorage.getItem("bo_token");
  try {
    const r = await fetch(
      `${API_URL}/api/admin/clientes/${idCliente}/documentos/zip`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!r.ok) { dialog.toast("No se pudo generar el ZIP de documentos", "error"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreCliente}_documentos.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    dialog.toast("Error al descargar los documentos", "error");
  }
}

export { API_URL };
