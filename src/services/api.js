// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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



export async function apiGET(url) {
  const r = await fetch(API_URL + url, {
    headers: { ...authHeaders() },
  });
  return r.json();
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
