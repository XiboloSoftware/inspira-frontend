// src/services/backofficeApi.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("bo_token");
}

function baseHeaders() {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// IMPORTANTE: todos con credentials: "include"

export async function boGET(path) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "GET",
    credentials: "include",           // <<< Faltaba esto
    headers: {
      ...baseHeaders(),
    },
  });
  return r.json();
}

export async function boPOST(path, body) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function boPUT(path, body) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders(),
    },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function boDELETE(path) {
  const r = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      ...baseHeaders(),
    },
  });
  return r.json();
}
