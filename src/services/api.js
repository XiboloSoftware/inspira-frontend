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
