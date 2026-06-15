import { apiFetch } from "./api";

export async function fetchAllReviews() {
  const res = await apiFetch("/avis/");
  if (!res.ok) throw new Error("Erreur chargement avis");
  return res.json();
}

export async function fetchReviewsByCommerce(commerceId) {
  const res = await apiFetch(`/avis/commerce/${commerceId}/`);
  if (!res.ok) throw new Error("Erreur chargement avis commerce");
  return res.json();
}

export async function fetchReviewStats(commerceId) {
  const res = await apiFetch(`/avis/commerce/${commerceId}/stats/`);
  if (!res.ok) throw new Error("Erreur chargement stats");
  return res.json();
}

export async function createReview(payload) {
  const res = await apiFetch("/avis/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function updateReview(id, payload) {
  const res = await apiFetch(`/avis/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function deleteReview(id) {
  const res = await apiFetch(`/avis/${id}/delete/`, {
    method: "DELETE",
  });
  if (res.status !== 200 && res.status !== 204) {
    throw new Error("Erreur suppression avis");
  }
}

export async function reactToReview(id, action) {
  const res = await apiFetch(`/avis/${id}/react/`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Erreur reaction");
  return res.json();
}

export async function reportReview(id, reason, description = "") {
  const res = await apiFetch(`/avis/${id}/report/`, {
    method: "POST",
    body: JSON.stringify({ reason, description }),
  });
  if (!res.ok) throw new Error("Erreur signalement");
  return res.json();
}
