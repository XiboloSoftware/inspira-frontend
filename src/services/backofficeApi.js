// src/services/backofficeApi.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("bo_token");
}

function baseHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET
export async function boGET(path) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      ...baseHeaders(),
    },
  });
  return r.json();
}

// POST
export async function boPOST(path, body) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

// PUT
export async function boPUT(path, body) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

// PATCH ← FALTABA ESTA FUNCIÓN
export async function boPATCH(path, body) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

// DELETE
export async function boDELETE(path) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...baseHeaders(),
    },
  });
  return r.json();
}
