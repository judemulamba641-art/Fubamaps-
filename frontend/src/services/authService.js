import API_BASE, { apiFetch } from "./api";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw data;

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  return data;
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function getMe() {
  const res = await apiFetch("/users/me/");
  if (!res.ok) throw new Error("Non authentifie");
  return res.json();
}

export async function updateProfile(payload) {
  const res = await apiFetch("/users/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function changePassword(payload) {
  const res = await apiFetch("/users/change-password/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  try {
    await apiFetch("/users/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // silently ignore
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}
