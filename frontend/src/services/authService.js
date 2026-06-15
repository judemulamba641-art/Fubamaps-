/**
 * Service d'authentification FubaMaps.
 * Gestion JWT : login, register, logout, refresh, profil.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "fubamaps_access";
const REFRESH_KEY = "fubamaps_refresh";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(access, refresh) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail ||
      data.non_field_errors?.[0] ||
      Object.values(data).flat().join(", ") ||
      "Erreur serveur";
    throw new Error(msg);
  }
  return data;
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  saveTokens(data.access, data.refresh);
  return data;
}

export async function logout() {
  const refresh = getRefreshToken();
  try {
    await fetch(`${API_BASE}/users/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // silently fail logout
  }
  clearTokens();
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/users/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await handleResponse(res);
  saveTokens(data.access, data.refresh || refresh);
  return data.access;
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/users/me/`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function updateProfile(payload) {
  const res = await fetch(`${API_BASE}/users/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function changePassword(oldPassword, newPassword, confirmPassword) {
  const res = await fetch(`${API_BASE}/users/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    }),
  });
  return handleResponse(res);
}

export async function authFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...options.headers,
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try {
      await refreshAccessToken();
      const retryHeaders = {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...options.headers,
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    } catch {
      clearTokens();
      throw new Error("Session expirée");
    }
  }

  return res;
}

export function isAuthenticated() {
  return !!getAccessToken();
}
