/**
 * Service d'authentification FubaMaps.
 * Gere login, register, logout, refresh token et gestion du profil.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "fubamaps_access";
const REFRESH_KEY = "fubamaps_refresh";
const USER_KEY = "fubamaps_user";

// --- Token Management ---

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// --- Auth Headers ---

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- API Calls ---

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.email?.[0] || err.password?.[0] || err.detail || "Erreur de connexion");
  }

  const data = await res.json();
  setTokens(data.tokens.access, data.tokens.refresh);
  setStoredUser(data.user);
  return data;
}

export async function register(firstName, lastName, email, password, passwordConfirm) {
  const res = await fetch(`${API_BASE}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirm: passwordConfirm,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    const msg = err.email?.[0] || err.password?.[0] || err.password_confirm?.[0] || err.detail || "Erreur d'inscription";
    throw new Error(msg);
  }

  const data = await res.json();
  setTokens(data.tokens.access, data.tokens.refresh);
  setStoredUser(data.user);
  return data;
}

export async function logout() {
  const refresh = getRefreshToken();
  if (refresh) {
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
      // Ignore errors on logout
    }
  }
  clearTokens();
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/users/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  setTokens(data.access, data.refresh || refresh);
  return data.access;
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/users/me/`, {
    headers: { ...authHeaders() },
  });

  if (!res.ok) {
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await fetch(`${API_BASE}/users/me/`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (retry.ok) {
          const user = await retry.json();
          setStoredUser(user);
          return user;
        }
      }
      clearTokens();
      return null;
    }
    return null;
  }

  const user = await res.json();
  setStoredUser(user);
  return user;
}

export async function updateProfile(data) {
  const res = await fetch(`${API_BASE}/users/profile/update/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Erreur de mise a jour du profil");
  }

  const user = await res.json();
  setStoredUser(user);
  return user;
}

export async function changePassword(oldPassword, newPassword, newPasswordConfirm) {
  const res = await fetch(`${API_BASE}/users/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.old_password?.[0] || err.new_password?.[0] || err.detail || "Erreur");
  }

  return await res.json();
}

export function isAuthenticated() {
  return !!getAccessToken();
}
