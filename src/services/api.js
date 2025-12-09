// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}


async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}


// GET genérico para panel cliente
export async function apiGET(url) {
  const r = await fetch(API_URL + url, {
    headers: { ...authHeaders() },
    cache: "no-store", // <- desactiva caché, evita 304
  });

  const data = await parseJsonSafe(r);

  // si la API no envía `ok`, lo inferimos de response.ok
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
    cache: "no-store",
  });

  return parseJsonSafe(r);
}


export async function apiPATCH(url, body) {
  const r = await fetch(API_URL + url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return parseJsonSafe(r);
}


export async function apiUpload(path, formData) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: {
      ...authHeaders(), // JWT del cliente
    },
    body: formData,
    cache: "no-store",
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



export async function getProgramacionPostulaciones(idSolicitud) {
  return apiGET(`/solicitudes/${idSolicitud}/programacion-postulaciones`);
}
