// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGET(url) {
  const r = await fetch(API_URL + url, {
    headers: { ...authHeaders() },
  });

  // Si el servidor responde 304 (Not Modified) o 204 (No Content),
  // no hay body que parsear; devolvemos un objeto neutro.
  if (r.status === 304 || r.status === 204) {
    return { ok: true, status: r.status };
  }

  let data = {};
  try {
    data = await r.json();
  } catch (e) {
    // Por si alguna respuesta viene sin body aunque no sea 304/204
    data = {};
  }

  // Si la API no incluye "ok", lo añadimos a partir de r.ok
  if (typeof data.ok === "undefined") {
    data.ok = r.ok;
  }

  return data;
}

export async function apiPOST(url, body) {
  const r = await fetch(API_URL + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}
export async function apiPATCH(url, body) {
  const r = await fetch(API_URL + url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function apiUpload(path, formData) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: {
      // IMPORTANTE: enviamos el JWT igual que en apiGET/apiPATCH
      ...authHeaders(),
    },
    body: formData, // no poner Content-Type, el navegador lo arma solo
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // por si el backend devuelve vacío
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.msg || data.message || "Error al subir archivo");
  }

  return data;
}


export async function boUpload(path, file) {
  const formData = new FormData();
  formData.append("archivo", file);

  const r = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { ...baseHeaders() }, // solo Authorization; NO Content-Type
    body: formData,
  });

  return r.json();
}
