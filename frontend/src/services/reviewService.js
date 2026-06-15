/**
 * Service API Avis (Reviews) - FubaMaps.
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

export async function fetchAllReviews() {
  const res = await fetch(`${API_BASE}/avis/`);
  return handleResponse(res);
}

export async function fetchCommerceReviews(commerceId) {
  const res = await fetch(`${API_BASE}/avis/commerce/${commerceId}/`);
  return handleResponse(res);
}

export async function fetchCommerceStats(commerceId) {
  const res = await fetch(`${API_BASE}/avis/commerce/${commerceId}/stats/`);
  return handleResponse(res);
}

export async function createReview(payload) {
  const res = await authFetch(`${API_BASE}/avis/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateReview(id, payload) {
  const res = await authFetch(`${API_BASE}/avis/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteReview(id) {
  const res = await authFetch(`${API_BASE}/avis/${id}/delete/`, {
    method: "DELETE",
  });
  if (res.status === 204 || res.status === 200) return { success: true };
  const data = await res.json().catch(() => ({}));
  throw new Error(data.detail || "Erreur suppression");
}

export async function reactToReview(id, action) {
  const res = await fetch(`${API_BASE}/avis/${id}/react/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
}

export async function reportReview(id, reason, description = "") {
  const res = await fetch(`${API_BASE}/avis/${id}/report/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason, description }),
  });
  return handleResponse(res);
}

export async function fetchMyReviews() {
  const res = await authFetch(`${API_BASE}/avis/me/`);
  return handleResponse(res);
}
