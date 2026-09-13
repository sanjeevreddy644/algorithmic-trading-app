const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 10000);
export const AUTH_EXPIRED_EVENT = "auth:expired";

export function getAccessToken() { return localStorage.getItem("accessToken"); }
export function getRefreshToken() { return localStorage.getItem("refreshToken"); }
export function setTokens(tokens) {
  if (tokens?.accessToken) localStorage.setItem("accessToken", tokens.accessToken);
  if (tokens?.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
}
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// The backend responds with { error: { message } }; fall back to other shapes.
function errorMessage(data, status) {
  if (typeof data?.error?.message === "string") return data.error.message;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string" && data.message) return data.message;
  return `Request failed (${status})`;
}

async function request(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try {
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
    return { response, data };
  } finally { clearTimeout(timer); }
}

// Shared so concurrent 401s trigger a single refresh call.
let refreshInFlight = null;
function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      const { response, data } = await request("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) });
      if (!response.ok || !data?.tokens?.accessToken) return false;
      setTokens(data.tokens);
      return true;
    })().catch(() => false).finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function apiFetch(path, options = {}) {
  let { response, data } = await request(path, options);
  if (response.status === 401 && !path.startsWith("/auth/") && getRefreshToken()) {
    if (await refreshAccessToken()) {
      ({ response, data } = await request(path, options));
    } else {
      clearTokens();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
  }
  if (!response.ok) {
    const error = new Error(errorMessage(data, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path, body) => apiFetch(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined })
};
