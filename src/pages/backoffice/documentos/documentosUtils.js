// Utilidades compartidas para la sección de Documentos
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
    if (!r.ok) { alert("No se pudo descargar el archivo"); return; }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.nombre_original;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    alert("Error al descargar el archivo");
  }
}

export { API_URL };
