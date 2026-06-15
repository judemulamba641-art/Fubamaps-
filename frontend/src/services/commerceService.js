/**
 * Service API Commerces - FubaMaps.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

import { authFetch } from "./authService";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail ||
      Object.values(data).flat().join(", ") ||
      "Erreur serveur";
    throw new Error(msg);
  }
  return data;
}

export async function fetchCommerces(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/commerces/${query ? `?${query}` : ""}`;
  const res = await fetch(url);
  const data = await handleResponse(res);
  return data.results || data;
}

export async function fetchCommerceDetail(id) {
  const res = await fetch(`${API_BASE}/commerces/${id}/`);
  return handleResponse(res);
}

export async function createCommerce(payload) {
  const res = await authFetch(`${API_BASE}/commerces/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateCommerce(id, payload) {
  const res = await authFetch(`${API_BASE}/commerces/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCommerce(id) {
  const res = await authFetch(`${API_BASE}/commerces/${id}/delete/`, {
    method: "DELETE",
  });
  if (res.status === 204 || res.status === 200) return { success: true };
  const data = await res.json().catch(() => ({}));
  throw new Error(data.detail || "Erreur suppression");
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/commerces/categories/`);
  return handleResponse(res);
}

export async function fetchTypes() {
  const res = await fetch(`${API_BASE}/commerces/types/`);
  return handleResponse(res);
}

export async function fetchNearby(lat, lng, radius = 5) {
  const res = await fetch(
    `${API_BASE}/commerces/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return handleResponse(res);
}
