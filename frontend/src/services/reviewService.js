/**
 * Service pour les avis FubaMaps.
 * Gere CRUD avis, stats, reactions et signalements.
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

// --- Avis CRUD ---

export async function fetchAllReviews() {
  const res = await fetch(`${API_BASE}/avis/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchCommerceReviews(commerceId, filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = `${API_BASE}/avis/commerce/${commerceId}/${query ? "?" + query : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createReview(data) {
  const res = await fetch(`${API_BASE}/avis/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateReview(id, data) {
  const res = await fetch(`${API_BASE}/avis/${id}/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteReview(id) {
  const res = await fetch(`${API_BASE}/avis/${id}/delete/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Erreur lors de la suppression de l'avis");
  }
  return true;
}

// --- Stats ---

export async function fetchCommerceStats(commerceId) {
  const res = await fetch(`${API_BASE}/avis/commerce/${commerceId}/stats/`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// --- Reactions ---

export async function reactToReview(id, action) {
  const res = await fetch(`${API_BASE}/avis/${id}/react/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
}

// --- Report ---

export async function reportReview(id, reason, description = "") {
  const res = await fetch(`${API_BASE}/avis/${id}/report/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ reason, description }),
  });
  return handleResponse(res);
}
