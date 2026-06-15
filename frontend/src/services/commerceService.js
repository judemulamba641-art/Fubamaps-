import { apiFetch } from "./api";

export async function fetchCommerces() {
  const res = await apiFetch("/commerces/");
  if (!res.ok) throw new Error("Erreur chargement commerces");
  const data = await res.json();
  return data.results || data;
}

export async function fetchCategories() {
  const res = await apiFetch("/commerces/categories/");
  if (!res.ok) throw new Error("Erreur chargement categories");
  return res.json();
}

export async function fetchTypes() {
  const res = await apiFetch("/commerces/types/");
  if (!res.ok) throw new Error("Erreur chargement types");
  return res.json();
}

export async function fetchCommerceDetail(id) {
  const res = await apiFetch(`/commerces/${id}/`);
  if (!res.ok) throw new Error("Commerce introuvable");
  return res.json();
}

export async function createCommerce(payload) {
  const res = await apiFetch("/commerces/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function updateCommerce(id, payload) {
  const res = await apiFetch(`/commerces/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function deleteCommerce(id) {
  const res = await apiFetch(`/commerces/${id}/delete/`, {
    method: "DELETE",
  });
  if (res.status !== 200 && res.status !== 204) {
    throw new Error("Erreur suppression");
  }
}
