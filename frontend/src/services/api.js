/**
 * Configuration API centrale.
 * L'URL de base est detectee automatiquement en dev ou configurable via env.
 */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000/api"
    : `${window.location.origin}/api`);

export default API_BASE;

/**
 * Fetch wrapper avec gestion JWT automatique.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
      return fetch(`${API_BASE}${path}`, { ...options, headers });
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth:logout"));
  }

  return res;
}

async function tryRefreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/users/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }
    return true;
  } catch {
    return false;
  }
}
