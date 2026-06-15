/**
 * Service pour les commerces FubaMaps.
 * Gere CRUD commerces, categories et types.
 */

import { getAccessToken } from "./authService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Erreur ${res.status}`);
  }
  return res.json();
}

// --- Commerces ---

export async function fetchCommerces(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/commerces/${query ? "?" + query : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await handleResponse(res);
  return data.results || data;
}

export async function fetchCommerceDetail(id) {
  const res = await fetch(`${API_BASE}/commerces/${id}/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createCommerce(data) {
  const res = await fetch(`${API_BASE}/commerces/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCommerce(id, data) {
  const res = await fetch(`${API_BASE}/commerces/${id}/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCommerce(id) {
  const res = await fetch(`${API_BASE}/commerces/${id}/delete/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Erreur lors de la suppression");
  }
  return true;
}

// --- Categories ---

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/commerces/categories/`, { headers: authHeaders() });
  return handleResponse(res);
}

// --- Types ---

export async function fetchTypes() {
  const res = await fetch(`${API_BASE}/commerces/types/`, { headers: authHeaders() });
  return handleResponse(res);
}

// --- Nearby ---

export async function fetchNearby(lat, lng, radius = 5000) {
  const params = new URLSearchParams({ lat, lng, radius });
  const res = await fetch(`${API_BASE}/commerces/nearby/?${params}`, { headers: authHeaders() });
  return handleResponse(res);
}
